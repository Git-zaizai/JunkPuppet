import { fork } from "child_process";
import { join } from "node:path";
import { fswriteFile, fsreadFile, deleteFile, deleteDir } from "../utils/file";
import { triggerItemCron } from "./cron";
import { taskDataDb, taskListDb } from "./db";
import { randomUUID } from "crypto";

// 新增任务
export const addTask = async (params: any) => {
  const database = await taskListDb();
  if (database.chain.get("list").find({ name: params.name }).value()) {
    throw new Error("名称重复");
  }
  const datanow = Date.now();
  const uid = randomUUID();
  database.chain
    .get("list")
    .unshift({
      ...params,
      mockDataId: "",
      _id: uid,
      createdAt: datanow,
      updatedAt: datanow,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 编辑任务
export const updateTask = async (params: any) => {
  const database = await taskListDb();
  if (!params._id) {
    throw new Error("缺少任务ID");
  }
  triggerItemCron(params);
  const datanow = Date.now();
  database.chain
    .get("list")
    .find({ _id: params._id })
    .assign({
      ...params,
      updatedAt: datanow,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 删除任务
export const deleteTask = async (params: any) => {
  const database = await taskListDb();
  if (!params._id) {
    throw new Error("缺少任务ID");
  }
  // 删除定时任务
  const cron = global.cronList.get(params._id);
  if (cron) {
    cron.stop();
    global.cronList.delete(params._id);
  }
  const target = database.chain.get("list").find({ _id: params._id }).value();
  if (target.mockDataId) {
    // 删除截图文件夹
    await deleteDir(join(process.env.DATA_PATH_SNAPSHOT, params._id));
    // 删除JSON文件
    await deleteFile(
      join(process.env.DATA_PATH_JSON, `${target.mockDataId}.json`)
    );
    // 删除任务数据
    await deleteTaskDataDb({ taskId: params._id });
  }
  const datanow = Date.now();
  database.chain.get("list").remove({ _id: params._id }).value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "ok";
};
// 获取任务列表
export const getTaskList = async (params: any) => {
  const database = await taskListDb();
  let result = null;
  if (params?.text) {
    result = database.chain
      .get("list")
      .filter((item) => item.name.includes(params.text))
      .value();
  } else {
    result = database.chain.get("list").orderBy(["updatedAt"], "desc").value();
  }
  return result;
};
// 获取任务配置详情
export const getTaskConfigDetail = async (params: any) => {
  const database = await taskListDb();
  const result: any = database.chain
    .get("list")
    .find({ _id: params._id })
    .value();
  if (result.mockDataId) {
    const mockData = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${result.mockDataId}.json`)
    );
    return {
      ...result,
      mockData: mockData,
    };
  }
  return result;
};
// 修改模拟数据Json文件
export const updateTaskMockData = async (params: any) => {
  const fileName = `${params.uid}.json`;
  await fswriteFile(
    join(process.env.DATA_PATH_JSON, fileName),
    JSON.stringify({
      builtInData: params.builtInData,
      customFn: params.customFn,
    })
  );
  const database = await taskListDb();
  database.chain.set("updatedAt", Date.now()).value();
  await database.write();
  return "ok";
};
// 获取任务数据详情
export const getTaskDataDetail = async (params: any) => {
  const database = await taskDataDb();
  const result = database.chain
    .get("list")
    .filter({ taskId: params._id })
    .value();
  return result;
};

// 删除任务所产生的数据
export const deleteTaskDataDb = async (params: any) => {
  const datanow = Date.now();
  const database = await taskDataDb();
  database.chain
    .get("list")
    .remove({
      taskId: params.taskId,
    })
    .value();
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return true;
};
// 开始设置模拟数据
export const startSetting = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/setting.js`);
    ChildProcess.send({
      type: "StartSetting",
      params: {
        targetUrl: params.targetUrl,
        chromePath: process.env.CHROME_PATH,
        headless: false,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: any) => {
        if (msg.type === "finish") {
          const uid = params?.mockDataId || randomUUID();
          const fileName = `${uid}.json`;
          await fswriteFile(
            join(process.env.DATA_PATH_JSON, fileName),
            JSON.stringify(msg.data)
          );
          const datanow = Date.now();
          const database = await taskListDb();
          database.chain
            .get("list")
            .find({ _id: params._id })
            .assign({
              mockDataId: uid,
              updatedAt: datanow,
            })
            .value();
          database.chain.set("updatedAt", datanow).value();
          await database.write();
          resolve(fileName);
        } else if (msg.type === "warn") {
          console.warn(
            `任务: ${params.name} - 设置警告 - ` + JSON.stringify(msg.data)
          );
        } else if (msg.type === "error") {
          console.error(
            `任务: ${params.name} - 设置出错 - ` + JSON.stringify(msg.data)
          );
        }
      });
      ChildProcess.on("error", function (code) {
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.log(`setter start error：${error.message}`);
  }
};
// 上传JSON模拟数据
export const uploadJSONSetting = async (params: any) => {
  const database = await taskListDb();
  const datanow = Date.now();
  const taskChain: any = database.chain.get("list").find({ _id: params._id });
  const result: any = taskChain.value();
  if (result?.mockDataId) {
    const fileName = `${result.mockDataId}.json`;
    await fswriteFile(join(process.env.DATA_PATH_JSON, fileName), params.data);
    taskChain
      .assign({
        updatedAt: datanow,
      })
      .value();
  } else {
    const uid = randomUUID();
    const fileName = `${uid}.json`;
    await fswriteFile(join(process.env.DATA_PATH_JSON, fileName), params.data);
    taskChain
      .assign({
        mockDataId: uid,
        updatedAt: datanow,
      })
      .value();
  }
  database.chain.set("updatedAt", datanow).value();
  await database.write();
  return "success";
};
// 调试任务操作运行，放慢速度，可视化
export const debugPlay = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/runner.js`);
    const data = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${params.mockDataId}.json`)
    );
    ChildProcess.send({
      type: "StartRunning",
      params: {
        targetUrl: params.targetUrl,
        parent: join(process.env.DATA_PATH_SNAPSHOT, params._id),
        cookies: [],
        chromePath: process.env.CHROME_PATH,
        headless: false,
        slowMo: 100,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
        data: data,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: any) => {
        if (msg.type === "result") {
          const database = await taskDataDb();
          const datanow = Date.now();
          const uid = randomUUID();
          database.chain
            .get("list")
            .unshift({
              ...msg.data,
              taskId: params._id,
              taskMockId: params.mockDataId,
              _id: uid,
              createdAt: datanow,
            })
            .value();
          database.chain.set("updatedAt", datanow).value();
          await database.write();
          resolve("sucess");
        } else if (msg.type === "warn") {
          console.warn(
            `任务: ${params.name} - 执行警告 - ` + JSON.stringify(msg.data)
          );
        } else if (msg.type === "error") {
          console.error(
            `任务: ${params.name} - 执行出错 - ` + JSON.stringify(msg.data)
          );
        }
      });
      ChildProcess.on("error", function (code) {
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.log(`runner start error：${error.message}`);
  }
};
// 开始模拟操作运行
export const startplay = async (params: any) => {
  try {
    const ChildProcess = fork(`${process.env.SCRIPTS_PATH}/runner.js`);
    const data = await fsreadFile(
      join(process.env.DATA_PATH_JSON, `${params.mockDataId}.json`)
    );
    console.log("任务：" + params.name + " - 开始执行");
    ChildProcess.send({
      type: "StartRunning",
      params: {
        targetUrl: params.targetUrl,
        parent: join(process.env.DATA_PATH_SNAPSHOT, params._id),
        cookies: [],
        chromePath: process.env.CHROME_PATH,
        headless: "new",
        slowMo: 100,
        chromeDataPath: process.env.DATA_PATH_CHROME_DATA,
        data: data,
      },
    });
    return new Promise((resolve, reject) => {
      ChildProcess.on("message", async (msg: any) => {
        if (msg.type === "result") {
          const database = await taskDataDb();
          const datanow = Date.now();
          const uid = randomUUID();
          database.chain
            .get("list")
            .unshift({
              ...msg.data,
              taskId: params._id,
              taskMockId: params.mockDataId,
              _id: uid,
              createdAt: datanow,
            })
            .value();
          database.chain.set("updatedAt", datanow).value();
          await database.write();
          console.log("任务：" + params.name + " - 执行完成");
          resolve("sucess");
        } else if (msg.type === "warn") {
          console.warn(
            `任务: ${params.name} - 执行警告 - ` + JSON.stringify(msg.data)
          );
        } else if (msg.type === "error") {
          console.error(
            `任务: ${params.name} - 执行出错 - ` + JSON.stringify(msg.data)
          );
        }
      });
      ChildProcess.on("error", function (code) {
        console.error(`任务: ${params.name} - 执行出错， 退出码：` + code);
        reject("exit error code: " + code);
      });
      ChildProcess.on("close", function (code) {
        console.info(`任务: ${params.name} - 结束并退出， 退出码：` + code);
        resolve("exit close code: " + code);
      });
    });
  } catch (error: any) {
    console.error(`任务: ${params.name} - 执行出错 - ` + error.message);
  }
};
