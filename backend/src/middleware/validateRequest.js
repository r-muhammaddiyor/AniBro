import { validationResult } from "express-validator";

const validateRequest = (request, response, next) => {
  const result = validationResult(request);

  if (result.isEmpty()) {
    return next();
  }

  response.status(422).json({
    message: "Validation failed",
    errors: result.array().map((item) => ({
      field: item.path,
      message: item.msg
    }))
  });
};

export default validateRequest;
