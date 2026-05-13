-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" VARCHAR(20) NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "attendance_config" (
    "id" SERIAL NOT NULL,
    "work_start_time" VARCHAR(5) NOT NULL,
    "work_end_time" VARCHAR(5) NOT NULL,
    "late_tolerance_minutes" INTEGER NOT NULL DEFAULT 15,
    "early_checkin_max_hours" DECIMAL(4,2) NOT NULL DEFAULT 3,
    "late_checkin_max_hours" DECIMAL(4,2) NOT NULL DEFAULT 4,
    "min_work_duration_hours" DECIMAL(4,2) NOT NULL DEFAULT 4,
    "updated_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_config_pkey" PRIMARY KEY ("id")
);
