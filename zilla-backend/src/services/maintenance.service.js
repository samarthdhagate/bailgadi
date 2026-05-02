const { query } = require('../config/db');

/**
 * Runs the database reconciliation function to clean up stale reservations
 * and sync slot capacities.
 */
const runReconciliation = async () => {
  try {
    const result = await query('SELECT * FROM reconcile_stale_reservations()');
    const { fixed_reservations, fixed_slot_counts, fixed_slot_statuses } = result.rows[0];
    
    if (fixed_reservations > 0 || fixed_slot_counts > 0 || fixed_slot_statuses > 0) {
      console.log(`[Reconciliation] Fixed: ${fixed_reservations} res, ${fixed_slot_counts} counts, ${fixed_slot_statuses} statuses`);
    }
  } catch (err) {
    console.error('[Reconciliation] Error running maintenance task:', err.message);
  }
};

/**
 * Start background maintenance jobs.
 */
const startMaintenanceJobs = () => {
  // Run every 2 minutes for high responsiveness
  setInterval(runReconciliation, 2 * 60 * 1000);
  
  // Also run immediately on startup
  runReconciliation();
};

module.exports = {
  runReconciliation,
  startMaintenanceJobs
};
