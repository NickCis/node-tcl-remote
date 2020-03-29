class Deferred<T, K extends Error> {
  public promise: Promise<T>;

  protected v?: T;
  protected rs?: (value?: T) => void;
  protected e?: K;
  protected rj?: (error?: K) => void;

  public constructor() {
    this.promise = new Promise((rs, rj): void => {
      this.rs = rs;
      this.rj = rj;

      if (this.v) rs(this.v);
      if (this.e) rj(this.e);
    });
  }

  public resolve(data: T): void {
    if (this.rs) this.rs(data);
    else this.v = data;
  }

  public reject(err: K): void {
    if (this.rj) this.rj(err);
    else this.e = err;
  }
}

export default Deferred;
