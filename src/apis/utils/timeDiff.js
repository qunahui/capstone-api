module.exports = function timeDifference(date1,date2) {
  const difference = date1.getTime() - date2.getTime();

  let daysDifference = Math.floor(difference/1000/60/60/24);
  // difference -= daysDifference*1000*60*60*24

  let hoursDifference = Math.floor(difference/1000/60/60);
  // difference -= hoursDifference*1000*60*60

  let minutesDifference = Math.floor(difference/1000/60);
  // difference -= minutesDifference*1000*60

  let secondsDifference = Math.floor(difference/1000);

  return {
    daysDifference,
    hoursDifference,
    minutesDifference,
    secondsDifference
  }
}