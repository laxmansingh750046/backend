import { execFile } from "child_process";
import { promisify } from "util";
import ffprobe from "ffprobe-static";

const execFilePromise = promisify(execFile);

export const getVideoDuration = async (filePath) => {
  try {
    const { stdout } = await execFilePromise(ffprobe.path, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);

    return parseInt(stdout.trim()); // returns seconds (e.g., 120.4)
  } catch (err) {
    throw new Error("Failed to get video duration");
  }
};
