/*
    Various utilities for job creation / modification
 */

const db = require("./raw_queries");
const Job = require("../job_system/job_queue/jobs/Job.js");

function createNewJob(jobType, payload, priority = Job.PRIORITIES.DEFAULT) {
  let query = `
    INSERT INTO jobs
           (job_type, status, payload, priority) 
    VALUES ( $(jobType), $(status), $(payload) $(priority) ) 
    RETURNING *
    `;
  let params = {
    jobType,
    payload,
    priority,
    status: Job.STATUS_TYPES.NEW,
  };

  return db.queryOne(query, params);
}

function getRunnableJobOfType(jobTypeArray) {
  const query = `
    SELECT * 
    FROM jobs 
    WHERE 
      job_type IN ( $(jobTypes):list ) 
      AND status IN ( $(statusTypes):list ) 
    ORDER BY 
      priority ASC
      id ASC 
    LIMIT 1
   `;
  const params = {
    statusTypes: [Job.STATUS_TYPES.NEW, Job.STATUS_TYPES.RETRY],
    jobTypes: jobTypeArray,
  };

  return db.queryOne(query, params);
}

function setJobToRunning(id) {
  return setJobToStatus(id, Job.STATUS_TYPES.RUNNING);
}

function setJobToFinished(id) {
  return setJobToStatus(id, Job.STATUS_TYPES.FINISHED);
}

function deleteFinishedJobs() {
  let query = "DELETE FROM jobs WHERE status = $1";
  let params = [Job.STATUS_TYPES.FINISHED];

  return db.query(query, params);
}

function setJobToStatus(id, status) {
  let query = "UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *";
  let params = [status, id];

  return db.queryOne(query, params);
}

function setJobToError(id, errors) {
  let query =
    "UPDATE jobs SET (status, errors) = ($1, $2) WHERE id = $3 RETURNING *";
  let params = [Job.STATUS_TYPES.ERROR, errors, id];

  return db.queryOne(query, params);
}

function setJobToRetry(id, payload) {
  let query =
    "UPDATE jobs SET (status, payload) = ($1, $2) WHERE id = $3 RETURNING *";
  let params = [Job.STATUS_TYPES.RETRY, payload, id];

  return db.queryOne(query, params);
}

module.exports = {
  createNewJob,
  getRunnableJobOfType,
  setJobToRunning,
  setJobToFinished,
  setJobToError,
  setJobToRetry,
  deleteFinishedJobs,
};
