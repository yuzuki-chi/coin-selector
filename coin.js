class Input {
    cb = () => {};
    coin = {
        cb: () => {},
        watch: cb => {
            this.coin.cb = cb;
        },
        unwatch: () => {},
    };
    pulse = 0;
    state = 0;  // 0: await, 1: detected

    constructor(interval = 1000) {
        this.interval = interval;

        this.coin.watch((err, value) => {
            if (err) {
                throw err;
            }

            if (this.state === 0 && value === 0) {
                this.state = 1;
                this.pulse = value;
                setTimeout(() => {
                    this.state = 0;
                    // console.debug(`pulse: ${this.pulse}`);
                    try {
                        this.cb(null, this.pulse2amount(this.pulse));
                    } catch (e) {
                        this.cb(err, -1);
                    }
                }, interval);
            } else {
                this.pulse += value;
            }
        });
    }
    pulse2amount(pulse = 0) {
        // pulse: amount,
        const table = {
            1: 1,
            2: 5,
            3: 10,
            4: 50,
            5: 100,
            6: 500,
        };
        const amount = table[pulse];
        if (isNaN(amount)) {
            throw new Error(`Invalid pulse: ${pulse}`);
        }
        return amount;
    }
    watch(cb = () => {}) {
        this.cb = cb;
    }
    stop() {
        this.coin.unwatch();
    }

    // コイン投入 (いらない)
    async input(pulse) {
        for (let i = 0; i < pulse * 2; i++) {
            this.coin.cb(null, i % 2);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}

const input = new Input();
input.watch((err, amount) => {
    if (err) {
        throw err;
    }
    console.log(`amount: ${amount}`);
});

void async function() {
    for (let i = 0; i < 7; i++) {
        await new Promise(r => setTimeout(r, 1000));
        await input.input(i);
    }
}();