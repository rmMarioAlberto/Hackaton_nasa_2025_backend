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

    console.log('Fetching exoplanets from planetas collection...'); // Debug log
    console.log('Limit:', limit, 'Skip:', skip);
    
    // Por alguna razón retorna todos los registros, ignorando el skip y limit
    const allExoplanets = await collection.find()
    .skip(skip)
    .limit(limit)
    .toArray();
    
    const total = allExoplanets.length; // Total number of exoplanets in the collection

    // Manual pagination by slicing the array
    const exoplanets = allExoplanets.slice(skip, skip + limit);
    
    console.log(`Found ${exoplanets.length} exoplanets returned, total: ${total}, page ${page}`); // Debug log
    console.log(`About to send response with ${exoplanets.length} items in data array`); // Debug log

    const response = {
      data: exoplanets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    };
    
    console.log(`Response data length: ${response.data.length}`); // Verify before sending
    res.status(200).json(response);
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

    console.log('Searching exoplanets with query:', JSON.stringify(query)); // Debug log
    const exoplanets = await collection.find(query).toArray();
    console.log(`Found ${exoplanets.length} exoplanets matching query`); // Debug log

    res.status(200).json({
      data: exoplanets,
      totalItems: exoplanets.length
    });
  } catch (error) {
    console.error('Error searching exoplanets:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = { getExoplanets, searchExoplanets };