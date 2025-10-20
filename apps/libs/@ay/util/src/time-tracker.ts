export class Job {
  public readonly startAt: number = Date.now();
  public endAt: number = null;
  public spend?: number = null;

  public constructor(public readonly name: string, public enable = true) {}

  public toJSON(): any {
    if (!this.enable) return undefined;
    return {
      name: this.name,
      spend: this.spend,
    };
  }

  public toString(prefix = '', isEnd = false) {
    if (!this.enable) return '';
    const char = isEnd ? '└ ' : '├ ';
    prefix += char;

    return `${prefix}${this.name} : ${(this.spend / 1000).toFixed(2)}s`;
  }

  public end(now = Date.now()) {
    if (!this.enable) return;
    this.endAt = now;
    this.spend = this.endAt - this.startAt;
  }
}

export class TimeTracker extends Job {
  public override endAt: number = null;
  public override spend: number = null;

  protected _previousStep: string;
  protected _jobs: Job[] = [];
  protected _isCompleted = false;

  public constructor(
    public override readonly name: string,
    public override enable = true,
  ) {
    super(name);
  }

  public step(jobName: string) {
    if (!this.enable) {
      return () => {};
    }

    if (this._previousStep) {
      this.endJob(this._previousStep);
    }
    this._previousStep = jobName;
    return this.startJob(jobName);
  }

  public deep(jobName: string) {
    if (!this.enable) return new TimeTracker(jobName, this.enable);
    if (this._previousStep) {
      this.endJob(this._previousStep);
    }

    if (this._jobs.find((job) => job.name === jobName)) {
      throw new Error(`任務 ${jobName} 已經存在`);
    }

    const timeTracker = new TimeTracker(jobName);
    this._jobs.push(timeTracker);
    return timeTracker;
  }

  public startJob(jobName: string) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    if (!this.enable) {
      return () => {};
    }

    if (this._jobs.find((job) => job.name === jobName)) {
      console.error(`任務 ${jobName} 已經存在`);
      return () => {};
    }

    this._jobs.push(new Job(jobName));

    return () => {
      this.endJob(jobName);
    };
  }

  public endJob(jobName: string) {
    if (!this.enable) return;
    const job = this._jobs.find((job) => job.name === jobName);

    if (!job) {
      console.error(`任務 ${jobName} 不存在`);
      return;
    }

    if (job.endAt !== null) {
      console.error(`任務 ${jobName} 已經結束`);
      return;
    }

    job.end();

    if (jobName === this._previousStep) {
      this._previousStep = null;
    }
  }

  public complete(now: number = Date.now()) {
    if (!this.enable) return;
    if (this._isCompleted) return;
    this._jobs.map((job) => {
      if (job.endAt === null) {
        job.end(now);
      }
      if (job instanceof TimeTracker) {
        job.complete(now);
      }
    });

    super.end(now);
    this._isCompleted = true;
  }

  public override toJSON() {
    if (!this.enable) return undefined;
    return {
      name: this.name,
      jobs: this._jobs.map((job) => job.toJSON()),
      spend: this.spend,
    };
  }

  public override toString(prefix = '', isEnd = false) {
    if (!this.enable) return '';
    const char = isEnd ? '└ ' : '├ ';

    return [
      `${prefix ? prefix + char : ''}${this.name} : ${(
        this.spend / 1000
      ).toFixed(2)}s`,
      ...this._jobs.map((job, index) => {
        return job.toString(
          prefix + (prefix ? (isEnd ? '  ' : '│ ') : '  '),
          index === this._jobs.length - 1,
        );
      }),
    ].join('\n');
  }
}
