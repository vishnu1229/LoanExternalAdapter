import process from "process";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios, { AxiosResponse } from "axios";

interface IData {
  loanId: string;
  stage2FinanceFee: number;
  penaltyCommitmentFee: number;
  penaltyFinanceFee: number;
  newrepaymentAmount: number;
}

interface EAOutput {
  jobRunId: string | number;
  statusCode: number;
  data: IData;
  error?: string;
}

const PORT = process.env.PORT || 8060;

const app: Express = express();

app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("External adapter");
});

app.post("/", async (req: Request, res: Response) => {
  const eaInputData: IData = req.body;
  console.log("req data res: ", eaInputData);

  const url = `https://oracle-api-data.onrender.com/l${eaInputData.loanId}`;

  let eaResponse: EAOutput = {
    data: {
      loanId: eaInputData.loanId,
      stage2FinanceFee: 0,
      penaltyCommitmentFee: 0,
      penaltyFinanceFee: 0,
      newrepaymentAmount: 0,
    },
    jobRunId: eaInputData.loanId,
    statusCode: 0,
  };

  try {
    const apiResponse: AxiosResponse<IData> = await axios.get(url);
    eaResponse.data = apiResponse.data;
    eaResponse.statusCode = apiResponse.status;
    console.log("returned res:", eaResponse);
    res.json(eaResponse);
  } catch (error: any) {
    console.log("api res error", error);
    eaResponse.error = error.message;
eaResponse.statusCode = error.response.status;
res.json(eaResponse);
}
});

app.listen(PORT, () => {
console.log(`Server is listening on port ${PORT}`);
});