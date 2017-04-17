const STATE_UNCHANGED = "unchanged";
const STATE_BEFORE_UPDATES = "before-updates";
const STATE_BETWEEN_UPDATES = "between-updates";
const STATE_BEFORE_SAVE = "before-save";
const STATE_FINISHED = "finished";
const STATE_UNCLEAN = "unclean";
const eventToState = {
    "init/install-missing": STATE_UNCLEAN,
    "init/collect": STATE_BEFORE_UPDATES,
    "batch-update/updating": STATE_UNCLEAN,
    "batch-update/testing": STATE_BETWEEN_UPDATES,
    "batch-update/rollback": STATE_UNCLEAN,
    "sequential-update/updating": STATE_UNCLEAN,
    "sequential-update/testing": STATE_BETWEEN_UPDATES,
    "sequential-update/rollback": STATE_UNCLEAN,
    "sequential-update": "sequential-update",
};

export default function handleExit(process, updtr) {
    let currentSequence = "start";

    updtr.on("start", () => void (currentSequence = "start"));
    updtr.on("init/start", () => void (currentSequence = "init"));
    updtr.on(
        "sequential-update/start",
        () => void (currentSequence = "sequential-update")
    );
    updtr.on(
        "sequential-update/start",
        () => void (currentSequence = "sequential-update")
    );
}
