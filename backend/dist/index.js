"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const controller_1 = __importDefault(require("./controller"));
const config_1 = require("./config");
const memoryDataManager_1 = require("./data_store/memoryDataManager");
const port = config_1.config.PORT;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use(controller_1.default);
const bootstrap = async () => {
    await memoryDataManager_1.dataManager.load();
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
};
bootstrap().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxnREFBa0M7QUFDbEMsc0RBQThCO0FBQzlCLDZDQUFtQztBQUNuQyw4REFBc0M7QUFDdEMscUNBQWtDO0FBQ2xDLHNFQUE2RDtBQUU3RCxNQUFNLElBQUksR0FBRyxlQUFNLENBQUMsSUFBSSxDQUFDO0FBRXpCLE1BQU0sR0FBRyxHQUFHLElBQUEsaUJBQU8sR0FBRSxDQUFDO0FBQ3RCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBQSxjQUFjLEdBQUUsQ0FBQyxDQUFDO0FBQzFCLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBQSxrQkFBSSxHQUFFLENBQUMsQ0FBQztBQUNoQixHQUFHLENBQUMsR0FBRyxDQUFDLG9CQUFVLENBQUMsQ0FBQztBQUVwQixNQUFNLFNBQVMsR0FBRyxLQUFLLElBQW1CLEVBQUU7SUFDeEMsTUFBTSwrQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXpCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBYyxFQUFFLEVBQUU7SUFDakMsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDIn0=