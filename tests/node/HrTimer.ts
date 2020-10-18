/**
 * The HrTimerValue breaks the run time into
 * whole seconds and separate milliseconds.
 */
export interface HrTimerValue {
	/** the number of full seconds elapsed */
	seconds: number,
	/** the milliseconds of the elapsed time */
	ms: number
}

/**
 * A timing class useful for profiling functions in node.
 */
export class HrTimer {
	protected hrstart: [number, number] = [0, 0];
	protected hrend: [number, number] = [0, 0];

	constructor() { }

	/**
	 * Start this timer
	 */
	public start() { this.hrstart = process.hrtime(); }

	/**
	 * Stop the timer
	 * @returns The execution time since start() was called
	 */
	public end(): HrTimerValue {
		this.hrend = process.hrtime(this.hrstart);
		return { seconds: this.hrend[0], ms: this.hrend[1] / 1000000 };
	}

	/**
	 * Time the execution of any function
	 * @param f A function to time
	 */
	public timeIt(f: () => any) {
		this.start();
		f();
		return this.end();
	}
}