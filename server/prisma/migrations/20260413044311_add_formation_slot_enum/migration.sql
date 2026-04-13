-- CreateEnum
CREATE TYPE "FormationSlot" AS ENUM ('GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB', 'LDM', 'CDM', 'RDM', 'LM', 'LCM', 'CM', 'RCM', 'RM', 'LAM', 'CAM', 'RAM', 'LW', 'RW', 'LF', 'RF', 'LS', 'RS', 'ST');

-- AlterTable: PlayerPosition(FW/MF/DF/GK) → FormationSlot 변환
-- 기존 데이터 대응: GK→GK, FW→ST, MF→CM, DF→CB
ALTER TABLE "match_quarter_assignments"
  ALTER COLUMN "position" TYPE "FormationSlot"
  USING CASE "position"::text
    WHEN 'GK' THEN 'GK'::"FormationSlot"
    WHEN 'FW' THEN 'ST'::"FormationSlot"
    WHEN 'MF' THEN 'CM'::"FormationSlot"
    WHEN 'DF' THEN 'CB'::"FormationSlot"
    ELSE 'CM'::"FormationSlot"
  END;
