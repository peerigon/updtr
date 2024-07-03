import inquirer from "inquirer";
import chalk from "chalk";
import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";
import splitUpdateTasks from "./tasks/util/splitUpdateTasks";
import batchUpdate from "./tasks/batchUpdate";
import createUpdateResult from "./tasks/util/createUpdateResult";
import finish from "./tasks/finish";
import updatePackageJson from "./tasks/updatePackageJson";

async function runUpdateTasks(updtr, updateTasks) {
    const results = [];
    const {breaking, nonBreaking} = splitUpdateTasks(updateTasks);
    const sequentialUpdateTasks = breaking.slice();
    let batchSuccess; // can be undefined, true or false
    let batchUpdateFailure;

    // Run batch update if we have more than one non-breaking update
    // If the batch update fails, it will roll back all modules except the first one.
    // This way we can skip one install command since we will run the sequential update for it anyway.
    if (nonBreaking.length > 1) {
        batchSuccess = await batchUpdate(updtr, nonBreaking);
    }

    if (batchSuccess === true) {
        results.push(
            ...nonBreaking.map(updateTask =>
                createUpdateResult(updateTask, true)
            )
        );
    } else {
        sequentialUpdateTasks.unshift(...nonBreaking);
        // If batchSuccess is false, we have actually executed the batch update and it returned false
        if (batchSuccess === false) {
            batchUpdateFailure = createUpdateResult(nonBreaking[0], false);
        }
    }

    // Run sequential update for all breaking updates and non-breaking batch updates that failed
    results.push(
        ...(await sequentialUpdate(
            updtr,
            sequentialUpdateTasks,
            batchUpdateFailure
        ))
    );

    return finish(updtr, results);
}

function generateChoices(tasks) {
    let dims = [
        "name".length,
        "from".length,
        // "to".length,
    ];

    dims = tasks.reduce((acc, {name, rollbackTo, updateTo}) => ([
        name.length > acc[0] ? name.length : acc[0],
        rollbackTo.length > acc[1] ? rollbackTo.length : acc[1],
        // updateTo.length > acc[2] ? updateTo.length : acc[2],
    ]), dims);

    let choices = [
        new inquirer.Separator(" "),
        new inquirer.Separator(chalk`  {green.bold.underline name}${"".padEnd((dims[0] + 3) - "name".length, " ")}{green.bold.underline from}${"".padEnd((dims[1] + 5) - "from".length, " ")}{green.bold.underline to}`),
    ];

    choices = choices.concat(tasks.map(task => ({
        name: chalk`{green ${task.name.padEnd(dims[0] + 3)}}{blue ${task.rollbackTo.padEnd(dims[1])}}  ❯  {blue ${task.updateTo}}`,
        value: task,
        short: `${task.name}@${task.updateTo}`,
    })));

    return choices;
}

async function selectUpdateTasks(tasks) {
    const prompt = inquirer.createPromptModule();
    const choices = generateChoices(tasks);

    const {packagesToUpdate} = await prompt([
        {
            name: "packagesToUpdate",
            type: "checkbox",
            message: chalk`{white.bold Choose which packages to update.}`,
            choices,
            pageSize: choices.length,
            validate: answer => Boolean(answer.length) || "You must choose at least one package.",
        },
    ]);

    return packagesToUpdate;
}

export default (async function run(updtr) {
    const results = [];

    updtr.emit("start", {
        config: updtr.config,
    });

    let {updateTasks} = await init(updtr);

    if (updtr.config.interactive === true) {
        updateTasks = await selectUpdateTasks(updateTasks);
    }

    if (updateTasks.length > 0) {
        results.push(...(await runUpdateTasks(updtr, updateTasks)));
        await updatePackageJson(updtr, results);
    }

    updtr.emit("end", {
        config: updtr.config,
        results,
    });

    return results;
});

