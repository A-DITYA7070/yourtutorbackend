import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
   const parse=new DataUriParser();
   const extName=path.extname(file.originalname).toString();
   return parse.format(extName,file.buffer);
}

export default getDataUri;