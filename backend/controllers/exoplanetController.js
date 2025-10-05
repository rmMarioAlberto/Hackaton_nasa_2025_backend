const mongoose = require('mongoose');
const configBD = require('../config/database');

// GET endpoint to retrieve exoplanets with pagination
async function getExoplanets(req, res) {
  try {
    // Ensure MongoDB connection is established
    if (mongoose.connection.readyState !== 1) {
      await configBD.connectMongo();
    }

    const page = parseInt(req.params.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    // Access the planetas collection directly
    const db = mongoose.connection.useDb('hackaton');
    const collection = db.collection('planetas');

    console.log('Fetching exoplanets - Page:', page, 'Skip:', skip, 'Limit:', limit);
    
    // Try MongoDB pagination first
    let exoplanets = await collection
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray();
    
    const total = exoplanets.length;
    
    // Safety check: if MongoDB returns more than expected, slice manually
    if (exoplanets.length > limit) {
      console.warn(`MongoDB returned ${exoplanets.length} docs, expected ${limit}. Applying manual slice.`);
      exoplanets = exoplanets.slice(0, limit);
    }
    
    console.log(`Returning ${exoplanets.length} of ${total} total exoplanets`);

    res.status(200).json({
      data: exoplanets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching exoplanets:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// GET endpoint to search exoplanets with filters
async function searchExoplanets(req, res) {
  try {
    // Ensure MongoDB connection is established
    if (mongoose.connection.readyState !== 1) {
      await configBD.connectMongo();
    }

    console.log('Search params received:', req.query);

    const query = {};

    // Define filterable fields
    const filterableFields = [
      'pl_name', 'hostname', 'pl_letter', 'k2_name', 'epic_hostname', 'epic_candname',
      'hd_name', 'hip_name', 'tic_id', 'gaia_id', 'disposition', 'discoverymethod',
      'disc_year', 'disc_facility', 'disc_telescope', 'disc_instrument', 'soltype'
    ];

    // Numeric fields for range queries
    const numericFields = [
      'sy_snum', 'sy_pnum', 'sy_mnum', 'pl_orbper', 'pl_orbsmax', 'pl_rade', 'pl_radj',
      'pl_masse', 'pl_massj', 'pl_msinie', 'pl_msinij', 'pl_cmasse', 'pl_cmassj',
      'pl_bmasse', 'pl_bmassj', 'pl_dens', 'pl_orbeccen', 'pl_insol', 'pl_eqt',
      'pl_orbincl', 'pl_tranmid', 'pl_imppar', 'pl_trandep', 'pl_trandur', 'pl_ratdor',
      'pl_ratror', 'pl_occdep', 'pl_orbtper', 'pl_orblper', 'pl_rvamp', 'pl_projobliq',
      'pl_trueobliq', 'st_teff', 'st_rad', 'st_mass', 'st_met', 'st_lum', 'st_logg',
      'st_age', 'st_dens', 'st_vsin', 'st_rotp', 'st_radv', 'sy_pm', 'sy_pmra',
      'sy_pmdec', 'sy_dist', 'sy_plx', 'sy_bmag', 'sy_vmag', 'sy_jmag', 'sy_hmag',
      'sy_kmag', 'sy_umag', 'sy_gmag', 'sy_rmag', 'sy_imag', 'sy_zmag', 'sy_w1mag',
      'sy_w2mag', 'sy_w3mag', 'sy_w4mag', 'sy_gaiamag', 'sy_tmag', 'sy_kepmag'
    ];

    // Boolean/flag fields
    const booleanFields = [
      'default_flag', 'cb_flag', 'rv_flag', 'pul_flag', 'ptv_flag', 'tran_flag',
      'ast_flag', 'obm_flag', 'micro_flag', 'etv_flag', 'ima_flag', 'dkin_flag',
      'pl_controv_flag', 'ttv_flag'
    ];

    // Build query based on provided parameters
    for (const [key, value] of Object.entries(req.query)) {
      if (filterableFields.includes(key)) {
        // Case-insensitive search for string fields
        query[key] = { $regex: value, $options: 'i' };
      } else if (numericFields.includes(key)) {
        // Handle numeric fields as exact match or range
        if (typeof value === 'string' && value.includes(',')) {
          const [min, max] = value.split(',').map(Number);
          if (!isNaN(min) && !isNaN(max)) {
            query[key] = { $gte: min, $lte: max };
          }
        } else {
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            query[key] = numValue;
          }
        }
      } else if (booleanFields.includes(key)) {
        // Handle boolean/flag fields (0 or 1)
        const numValue = Number(value);
        if (numValue === 0 || numValue === 1) {
          query[key] = numValue;
        }
      }
    }

    // Access the planetas collection directly
    const db = mongoose.connection.useDb('hackaton');
    const collection = db.collection('planetas');

    console.log('MongoDB query built:', JSON.stringify(query));
    
    // Get all documents and filter manually since MongoDB queries seem to be ignored
    const allExoplanets = await collection.find({}).toArray();
    console.log(`Total documents in collection: ${allExoplanets.length}`);
    
    // Manual filtering
    let filteredExoplanets = allExoplanets;
    
    if (Object.keys(query).length > 0) {
      filteredExoplanets = allExoplanets.filter(doc => {
        for (const [key, condition] of Object.entries(query)) {
          const value = doc[key];
          
          // Handle regex (string fields)
          if (condition.$regex) {
            const regex = new RegExp(condition.$regex, condition.$options || '');
            if (!value || !regex.test(String(value))) {
              return false;
            }
          }
          // Handle range queries (numeric fields)
          else if (condition.$gte !== undefined || condition.$lte !== undefined) {
            const numValue = Number(value);
            if (isNaN(numValue)) return false;
            if (condition.$gte !== undefined && numValue < condition.$gte) return false;
            if (condition.$lte !== undefined && numValue > condition.$lte) return false;
          }
          // Handle exact match
          else {
            if (value !== condition) {
              return false;
            }
          }
        }
        return true;
      });
    }
    
    console.log(`Filtered to ${filteredExoplanets.length} exoplanets`);

    res.status(200).json({
      data: filteredExoplanets,
      totalItems: filteredExoplanets.length,
      appliedFilters: query
    });
  } catch (error) {
    console.error('Error searching exoplanets:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = { getExoplanets, searchExoplanets };