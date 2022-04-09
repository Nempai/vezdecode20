/* configs */
const config = require("./config.json");

/* modules */
const { VK, Keyboard } = require("vk-io");

/* connection to vk */
const vk = new VK({
  token: config.token,
});

let questions = [];
let waitingReady = [];

/* hear messages */
vk.updates.on("message_new", async (context) => {
  console.log(context, context.senderId);

  const payload = context.messagePayload;

  if (payload) {
    if (payload === "ready") {
      if (waitingReady.includes(context.senderId)) {
        questions.push({
          user_id: context.senderId,
          question: [
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
            { answer: "waiting" },
          ],
        });

        console.log(questions);

        sendQuestion(context);
      }
    } else if (payload === "not_ready") {
      if (waitingReady.includes(context.senderId)) {
        for (let i = 0; i < waitingReady.length; i++) {
          if (waitingReady[i] === context.senderId) {
            waitingReady.splice(i, 1);
          }
        }

        await context.send("😢 Хорошо, будем ждать вас :p");
      }
    } else if (payload === "yes" || payload === "no") {
      if (waitingReady.includes(context.senderId)) {
        once = false;
        for (let i = 0; i < questions.length; i++) {
          if (questions[i].user_id === context.senderId) {
            for (let j = 0; j < questions[i].question.length; j++) {
              if (questions[i].question[j].answer === "waiting" && !once) {
                once = true;

                questions[i].question[j].answer = payload;

                if (j !== questions[i].question.length - 1) {
                  sendQuestion(context);
                } else {
                  let answers = `✅ Ваши ответы опроса:\n\n`;

                  for (let k = 0; k < questions[i].question.length; k++) {
                    answers += `№${k + 1} - ${
                      questions[i].question[k].answer
                    }\n`;
                  }

                  await context.send({
                    message: answers,
                    keyboard: Keyboard.keyboard([
                      [
                        Keyboard.textButton({
                          label: "Начать",
                        }),
                      ],
                    ]),
                  });

                  for (let m = 0; m < waitingReady.length; m++) {
                    if (waitingReady[m] === context.senderId) {
                      waitingReady.splice(m, 1);
                    }
                  }
                  for (let n = 0; n < questions.length; n++) {
                    if (questions[n].user_id === context.senderId) {
                      questions.splice(n, 1);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  if (context.text === "Привет") {
    await context.send({message: "👋 Привет вездекодерам!"})
    }

  if (context.text === "Начать") {
    await context.send({
      message: "👋 Привет! Готов начать опрос?",
      keyboard: Keyboard.keyboard([
        [
          Keyboard.textButton({
            label: "Да, готов",
            color: "positive",
            payload: "ready",
          }),
          Keyboard.textButton({
            label: "Нет, не готов :(",
            color: "negative",
            payload: "not_ready",
          }),
        ],
      ]),
    });

    if (!waitingReady.includes(context.senderId)) {
      waitingReady.push(context.senderId);
    }
  }
});

async function sendQuestion(context) {
  once = false;
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].user_id === context.senderId) {
      for (let j = 0; j < questions[i].question.length; j++) {
        if (questions[i].question[j].answer === "waiting") {
          if (!once) {
            once = true;

            await context.send({
              message: config.questions[j],
              keyboard: Keyboard.keyboard([
                [
                  Keyboard.textButton({
                    label: "Да",
                    color: "positive",
                    payload: "yes",
                  }),
                  Keyboard.textButton({
                    label: "Нет!!!!!!!",
                    color: "negative",
                    payload: "no",
                  }),
                ],
              ]),
            });
          }
        }
      }
    }
  }
}

/* start polling */
async function polling() {
  vk.updates.start().then(() => {
    console.log("Polling started!");
  });
}
polling().catch(console.error);
