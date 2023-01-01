import fs from "fs";
import Path from "path";

export class Files {
  static exist(filename: string, dir = "."): boolean {
    let _path = [dir];

    if(/\//.test(dir)) {
      _path = dir.split("/").filter(data => !!data.trim());
    }

    const path = Path.resolve(..._path, filename);

    return fs.existsSync(path);
  }
}