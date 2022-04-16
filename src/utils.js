var values = dict => {
    let vs = [];
    for (let k in dict) vs.push(dict[k]);
    return vs;
};

export default {
    merge: (a, b) => {
        let r = {};
        for (let k in a) r[k] = a[k];
        if (typeof b === 'object') for (let k in b) r[k] = b[k];
        return r;
    },
    copy: v => {
        let r = {};
        for (let k in v) r[k] = v[k];
        return r;
    },
    keys: dict => {
        let vs = [];
        for (let k in dict) vs.push(k);
        return vs;
    },
    values: values,
    union: (arrs, key) => {
        let cache = {};
        for (let i = 0; i < arrs.length ;i++) {
            let arr = arrs[i];
            for (let j = 0; j < arr.length; j++) {
                let ele = arr[j];
                cache[ele[key]] = ele;
            }
        }
        return values(cache);
    },
    intersect: (arrs, key) => {
        let counter = {};
        let cache = {};
        for (let i = 0; i < arrs.length ;i++) {
            let arr = arrs[i];
            for (let j = 0; j < arr.length; j++) {
                let ele = arr[j];
                let value = ele[key];
                counter[value] = (counter[value] || 0) + 1;
                cache[value] = ele;
            }
        }

        let r = [];
        for (let k in counter) {
            if (counter[k] == arrs.length) r.push(cache[k]);
        }
        return r;
    }
}