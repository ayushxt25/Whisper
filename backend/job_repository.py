from datetime import datetime, timezone

from database import SessionLocal
from db_models import ProcessingJob
from job_status import JobStatus


def create_processing_job(*, original_filename: str) -> ProcessingJob:
    job = ProcessingJob(original_filename=original_filename, status=JobStatus.QUEUED)
    with SessionLocal() as session:
        session.add(job)
        session.commit()
        session.refresh(job)
    return job


def get_processing_job(job_id: str) -> ProcessingJob | None:
    with SessionLocal() as session:
        return session.get(ProcessingJob, job_id)


def mark_job_processing(job_id: str) -> None:
    with SessionLocal() as session:
        job = session.get(ProcessingJob, job_id)
        if job is None:
            raise RuntimeError("Processing job not found")
        job.status = JobStatus.PROCESSING
        job.started_at = datetime.now(timezone.utc)
        job.error_message = None
        session.commit()


def mark_job_completed(job_id: str, meeting_id: str) -> None:
    with SessionLocal() as session:
        job = session.get(ProcessingJob, job_id)
        if job is None:
            raise RuntimeError("Processing job not found")
        job.status = JobStatus.COMPLETED
        job.meeting_id = meeting_id
        job.completed_at = datetime.now(timezone.utc)
        job.error_message = None
        session.commit()


def mark_job_failed(job_id: str, error_message: str) -> None:
    with SessionLocal() as session:
        job = session.get(ProcessingJob, job_id)
        if job is None:
            raise RuntimeError("Processing job not found")
        job.status = JobStatus.FAILED
        job.completed_at = datetime.now(timezone.utc)
        job.error_message = error_message
        session.commit()
