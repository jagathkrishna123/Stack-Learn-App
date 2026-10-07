import upload from "../config/multer.js";

/*
====================================
      SINGLE FILE UPLOAD
====================================
*/

export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

/*
====================================
     MULTIPLE FILE UPLOAD
====================================
*/

export const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/*
====================================
      MULTIPLE FIELDS UPLOAD
====================================
*/

export const uploadFields = (fields) => {
  return upload.fields(fields);
};