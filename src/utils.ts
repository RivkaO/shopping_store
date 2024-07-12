function groupBy(arr, property) {
    return arr.reduce(function (memo, x) {
        if (!memo[x[property]]) { memo[x[property]] = {description: x.description, amount: 1} }
        else { memo[x[property]].amount = memo[x[property]].amount + 1}
        return memo;
    }, {});
};

export default {
    groupBy
  };