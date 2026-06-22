import { z } from "zod";
import {
	joinClassroomBody,
	joinClassroomResponse,
} from "@/generated/classroom-zod";

//DTOs can be inferred from zod schemas, so we don't need to write them manually.
export type JoinClassroomBodyDto = z.infer<typeof joinClassroomBody>;

export type JoinClassroomResponseDto = z.infer<typeof joinClassroomResponse>;
