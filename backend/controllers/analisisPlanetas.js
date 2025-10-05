const mongoose = require('mongoose');
const mongo = require('../config/database').connectMongo;


const FIELDS_TO_ANALYZE_2 = [
    'pl_orbper',
    'pl_trandep',
    'pl_trandur',
    'pl_rade',
    'pl_imppar',
    'pl_ratror',
    'pl_ratdor',
    'st_rad',
    'st_teff'
];

const agregarPlanetas = async (req, res) => {
    try {
        const { planetas } = req.body;

        // Validar que el JSON tiene la estructura esperada
        if (!planetas || !planetas.data || !Array.isArray(planetas.data)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de JSON inválido. Se espera un objeto con "data" como un array.'
            });
        }

        // Verificar y asegurar conexión a MongoDB
        if (mongoose.connection.readyState !== 1) {
            await mongo();
        }

        // Verificar que la conexión tenga acceso a la base de datos
        if (!mongoose.connection.useDb('hackaton')) {
            throw new Error('No se pudo acceder a la base de datos de MongoDB');
        }

        const db = mongoose.connection.useDb('hackaton');
        const aprendisajeCollection = db.collection('aprendisaje');
        const planetasCollection = db.collection('planetas');

        // Obtener los umbrales más recientes desde la colección aprendisaje
        const latestLearningData = await aprendisajeCollection
            .find()
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (!latestLearningData || latestLearningData.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'No se encontraron datos de aprendizaje en la base de datos.'
            });
        }

        const confirmedData = latestLearningData[0].CONFIRMED;

        // Calcular pesos basados en la inversa de la desviación estándar
        const weights = {};
        let weightSum = 0;
        for (const field of FIELDS_TO_ANALYZE_2) {
            if (confirmedData[field] && confirmedData[field].parametros && confirmedData[field].parametros.desviacionEstandar) {
                weights[field] = 1 / confirmedData[field].parametros.desviacionEstandar;
                weightSum += weights[field];
            } else {
                weights[field] = 0; // En caso de datos faltantes
            }
        }

        // Normalizar pesos
        for (const field of FIELDS_TO_ANALYZE_2) {
            if (weightSum > 0) {
                weights[field] = weights[field] / weightSum;
            } else {
                weights[field] = 1 / FIELDS_TO_ANALYZE_2.length; // Peso uniforme si no hay datos
            }
        }

        // Contadores para el resumen
        let insertedCount = 0;
        let skippedCount = 0;
        let candidateCount = 0;
        let confirmedCount = 0;
        let refutedCount = 0;

        // Procesar cada planeta
        const planetsToInsert = [];

        for (const planet of planetas.data) {
            // Validar que todos los campos numéricos requeridos estén presentes y sean válidos
            let isValid = true;
            const planetData = {};

            // Copiar todos los campos del planeta dinámicamente
            Object.keys(planet).forEach(key => {
                planetData[key] = planet[key];
            });

            // Validar campos requeridos para la clasificación
            for (const field of FIELDS_TO_ANALYZE_2) {
                if (!planet.hasOwnProperty(field) ||
                    planet[field] === null ||
                    planet[field] === undefined ||
                    isNaN(parseFloat(planet[field])) ||
                    !isFinite(parseFloat(planet[field]))) {
                    isValid = false;
                    break;
                }
                // Convertir campos numéricos requeridos a float
                planetData[field] = parseFloat(planet[field]);
            }

            if (!isValid) {
                skippedCount++;
                continue;
            }

            // Calcular puntaje ponderado
            let score = 0;
            for (const field of FIELDS_TO_ANALYZE_2) {
                const value = planetData[field];
                const mean = confirmedData[field]?.parametros?.media || 0;
                const stdDev = confirmedData[field]?.parametros?.desviacionEstandar || 1;
                const normalizedDeviation = Math.abs((value - mean) / stdDev);
                score += weights[field] * normalizedDeviation;
            }

            // Asignar disposition basado en el puntaje
            const confirmedThreshold = 0.5; // Umbral para CONFIRMED (valores cercanos a la media)
            const refutedThreshold = 2.0;  // Umbral para REFUTED (valores extremos)
            if (score <= confirmedThreshold) {
                planetData.disposition = 'CONFIRMED';
                confirmedCount++;
            } else if (score > refutedThreshold) {
                planetData.disposition = 'REFUTED';
                refutedCount++;
            } else {
                planetData.disposition = 'CANDIDATE';
                candidateCount++;
            }

            planetsToInsert.push(planetData);
        }

        // Insertar planetas válidos en la colección planetas
        if (planetsToInsert.length > 0) {
            const insertResult = await planetasCollection.insertMany(planetsToInsert);
            insertedCount = insertResult.insertedCount;
        }

        recalcularAprendisaje().catch(err => console.error('Error en recalcularAprendisaje:', err));

        // Respuesta al usuario
        return res.status(200).json({
            success: true,
            message: 'Procesamiento de planetas completado.',
            result: {
                inserted: insertedCount,
                skipped: skippedCount,
                candidates: candidateCount,
                confirmed: confirmedCount,
                refuted: refutedCount
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



const FIELDS_TO_ANALYZE = {
    pl_orbper: {
        description: 'Período orbital del planeta (días)',
        zThreshold: 3,
        maxRemovalPercent: 10
    },
    pl_trandep: {
        description: 'Profundidad de tránsito (%)',
        zThreshold: 3.5,
        maxRemovalPercent: 10
    },
    pl_trandur: {
        description: 'Duración del tránsito (horas)',
        zThreshold: 3,
        maxRemovalPercent: 10
    },
    pl_rade: {
        description: 'Radio del planeta (R_Tierra)',
        zThreshold: 3.5,
        maxRemovalPercent: 10
    },
    pl_imppar: {
        description: 'Parámetro de impacto (0-1)',
        zThreshold: 3,
        maxRemovalPercent: 10
    },
    pl_ratror: {
        description: 'Ratio radio planeta/estrella',
        zThreshold: 3.5,
        maxRemovalPercent: 10
    },
    pl_ratdor: {
        description: 'Ratio eje semi-mayor/radio estelar',
        zThreshold: 3,
        maxRemovalPercent: 10
    },
    st_rad: {
        description: 'Radio de la estrella (R_Sol)',
        zThreshold: 3.5,
        maxRemovalPercent: 10
    },
    st_teff: {
        description: 'Temperatura efectiva de la estrella (K)',
        zThreshold: 3,
        maxRemovalPercent: 10
    }
};

const recalcularAprendisaje = async (planetasCollectionName = 'planetas', aprendisajeCollectionName = 'aprendisaje', maxIterations = 10) => {
    try {
        // Verificar y asegurar conexión a MongoDB
        if (mongoose.connection.readyState !== 1) {
            await mongo();
        }

        // Verificar que la conexión tenga acceso a la base de datos
        if (!mongoose.connection.useDb('hackaton')) {
            throw new Error('No se pudo acceder a la base de datos de MongoDB');
        }

        const db = mongoose.connection.useDb('hackaton')
        const planetasCollection = db.collection(planetasCollectionName);

        const learningData = {
            createdAt: new Date(),
            CONFIRMED: {},
            CANDIDATE: {},
            refutedThresholds: {}
        };

        // Procesar cada disposición
        for (const disposition of ['CONFIRMED', 'CANDIDATE']) {
            learningData[disposition] = {};

            // Procesar cada campo
            for (const [fieldName, fieldConfig] of Object.entries(FIELDS_TO_ANALYZE)) {
                const fieldResult = await analyzeFieldSilent(
                    planetasCollection,
                    fieldName,
                    disposition,
                    fieldConfig.zThreshold,
                    maxIterations
                );

                learningData[disposition][fieldName] = fieldResult;
            }
        }

        // Calcular umbrales REFUTED
        for (const [fieldName, fieldConfig] of Object.entries(FIELDS_TO_ANALYZE)) {
            const candidateData = learningData.CANDIDATE[fieldName];

            if (candidateData && candidateData.success) {
                learningData.refutedThresholds[fieldName] = {
                    description: fieldConfig.description,
                    zThreshold: fieldConfig.zThreshold,
                    limiteInferior: candidateData.rangos.limiteInferior,
                    limiteSuperior: candidateData.rangos.limiteSuperior
                };
            }
        }

        // Guardar en la colección de aprendizaje
        const aprendisajeCollection = db.collection(aprendisajeCollectionName);
        const insertResult = await aprendisajeCollection.insertOne(learningData);

        return {
            success: true,
            message: 'Aprendizaje recalculado y guardado exitosamente',
            insertedId: insertResult.insertedId,
            data: learningData
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

async function analyzeFieldSilent(collection, fieldName, disposition, zThreshold, maxIterations) {
    try {
        const query = {
            disposition: disposition,
            [fieldName]: { $ne: null, $exists: true }
        };

        const documents = await collection.find(query).toArray();

        if (documents.length === 0) {
            return {
                success: false,
                message: 'No hay datos disponibles',
                fieldName,
                disposition
            };
        }

        let currentPlanets = documents
            .map(doc => ({
                ...doc,
                [fieldName]: parseFloat(doc[fieldName])
            }))
            .filter(doc => {
                const val = doc[fieldName];
                return !isNaN(val) && isFinite(val);
            });

        if (currentPlanets.length < 2) {
            return {
                success: false,
                message: 'Datos insuficientes',
                fieldName,
                disposition
            };
        }

        const initialValidCount = currentPlanets.length;
        let iteration = 0;
        let removedCount = 0;
        let mean, stdDev;
        const allRemovedValues = [];

        do {
            iteration++;
            const beforeCount = currentPlanets.length;
            const values = currentPlanets.map(doc => doc[fieldName]);

            mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
            stdDev = Math.sqrt(variance);

            const removedInThisIteration = [];

            currentPlanets = currentPlanets.filter(doc => {
                const zScore = Math.abs((doc[fieldName] - mean) / stdDev);
                if (zScore > zThreshold) {
                    removedInThisIteration.push(doc[fieldName]);
                    return false;
                }
                return true;
            });

            removedCount = beforeCount - currentPlanets.length;

            if (removedInThisIteration.length > 0) {
                allRemovedValues.push(...removedInThisIteration);
            }

            if (removedCount === 0 || currentPlanets.length < 2 || iteration >= maxIterations) {
                break;
            }

        } while (true);

        const finalValues = currentPlanets.map(doc => doc[fieldName]);
        const minValue = Math.min(...finalValues);
        const maxValue = Math.max(...finalValues);
        const lowerBound = mean - (zThreshold * stdDev);
        const upperBound = mean + (zThreshold * stdDev);

        const gaussData = [];
        const step = stdDev / 10;
        const rangeMultiplier = 4;

        for (let x = mean - rangeMultiplier * stdDev; x <= mean + rangeMultiplier * stdDev; x += step) {
            const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
                Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2)));
            gaussData.push({
                x: parseFloat(x.toFixed(4)),
                y: parseFloat(y.toFixed(8))
            });
        }

        const originalCount = documents.length;
        const finalCount = currentPlanets.length;
        const removedTotal = initialValidCount - finalCount;
        const removedPercent = parseFloat(((removedTotal / initialValidCount) * 100).toFixed(1));
        const nullCount = originalCount - initialValidCount;

        return {
            success: true,
            fieldName,
            disposition,
            estadisticas: {
                totalDocumentos: originalCount,
                valoresNulos: nullCount,
                porcentajeNulos: parseFloat(((nullCount / originalCount) * 100).toFixed(1)),
                validosIniciales: initialValidCount,
                outliersEliminados: removedTotal,
                porcentajeEliminados: removedPercent,
                valoresFinales: finalCount
            },
            parametros: {
                media: parseFloat(mean.toFixed(4)),
                desviacionEstandar: parseFloat(stdDev.toFixed(4)),
                zThreshold: zThreshold,
                iteraciones: iteration
            },
            rangos: {
                limiteInferior: parseFloat(lowerBound.toFixed(4)),
                limiteSuperior: parseFloat(upperBound.toFixed(4))
            },
            gaussData,
            valoresEliminados: allRemovedValues
        };

    } catch (error) {
        return {
            success: false,
            message: error.message,
            fieldName,
            disposition
        };
    }
}

module.exports = { recalcularAprendisaje, agregarPlanetas };
