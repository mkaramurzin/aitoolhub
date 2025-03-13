import fs from "fs";
import S3rver from "s3rver";

new S3rver({
    // address: "192.168.1.15",
    port: 5000,
    directory: "./s3",
    configureBuckets: [
        {
            name: "aitoolhub",
            configs: [fs.readFileSync("./s3/cors.xml")]
        },
    ]
}).run();