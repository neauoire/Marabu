
var Oscs = function () {
    // OSCs

    this.osc_sin = function (value) {
        return Math.sin(value * 2 * Math.PI);
    };

    this.osc_abssin = function (value) {
        return 0.5 + Math.sin(value * 2 * Math.PI);
    }

    this.osc_saw = function (value) {
        return 2 * (value % 1) - 1;
    };

    this.osc_revsaw = function (value) {
        return 2 * (1 - (value % 1));
    }

    this.osc_square = function (value) {
        return (value % 1) < 0.5 ? 1 : -1;
    };

    this.osc_noise = function (value) {
        return (2 * Math.random() - 1);
    }

    this.osc_tri = function (value) {
        var v2 = (value % 1) * 4;
        if (v2 < 2) return v2 - 1;
        return 3 - v2;
    };
}