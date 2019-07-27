export const intersectionBy = (key, arrays) => {
  var result = []
  var lists = arrays

  for (var i = 0; i < lists.length; i++) {
    var currentList = lists[i]
    for (var y = 0; y < currentList.length; y++) {
      var currentValue = currentList[y]
      if (result.indexOf(currentValue[key]) === -1) {
        var existsInAll = true
        for (var x = 0; x < lists.length; x++) {
          if (!lists[x].find(x => x[key] === currentValue[key])) {
            existsInAll = false
            break
          }
        }
        if (existsInAll) {
          result.push(currentValue)
        }
      }
    }
  }
  return result
}

export const uniqBy = (arr, predicate) => {
  const cb = typeof predicate === 'function' ? predicate : o => o[predicate]

  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item)

        map.has(key) || map.set(key, item)

        return map
      }, new Map())
      .values(),
  ]
}

export const isBetween = (val, min, max) => val > min && val < max
