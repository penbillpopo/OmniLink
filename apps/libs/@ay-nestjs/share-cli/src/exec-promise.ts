import { exec } from 'child_process';

export async function execPromise(command: string) {
  console.log(command);
  try {
    const result = await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
          return;
        }

        resolve(stdout);
      });
    });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
