const fs = require('fs');
const csv = require('csv-parser');

// Define parameters for analysis
const consecutiveDaysThreshold = 7;
const minTimeBetweenShifts = 60 * 60 * 1000; // 1 hour in milliseconds
const maxTimeBetweenShifts = 10 * 60 * 60 * 1000; // 10 hours in milliseconds
const maxSingleShiftDuration = 14 * 60 * 60 * 1000; // 14 hours in milliseconds

// Initialize variables to keep track of employees meeting the criteria
const consecutiveDays = {};
const shortBreaks = {};
const longShifts = {};

// Read the CSV file and process the data
fs.createReadStream('input.csv')
  .pipe(csv())
  .on('data', (row) => {
    const employeeName = row['Employee Name'];
    const timeIn = new Date(row.Time);
    const timeOut = new Date(row['Time Out']);

    // Check consecutive days
    if (!consecutiveDays[employeeName]) {
      consecutiveDays[employeeName] = 1;
    } else {
      consecutiveDays[employeeName]++;
    }

    // Check time between shifts
    if (consecutiveDays[employeeName] > 1) {
      const timeDifference = timeIn - new Date(row['Previous Time Out']);
      if (timeDifference >= minTimeBetweenShifts && timeDifference <= maxTimeBetweenShifts) {
        shortBreaks[employeeName] = timeDifference;
      }
    }

    // Check single shift duration
    if (timeOut - timeIn > maxSingleShiftDuration) {
      longShifts[employeeName] = timeOut - timeIn;
    }

    row['Previous Time Out'] = row['Time Out'];
  })
  .on('end', () => {
    // Print the results
    console.log('Employees who have worked for 7 consecutive days:');
    for (const employee in consecutiveDays) {
      if (consecutiveDays[employee] >= consecutiveDaysThreshold) {
        console.log(`${employee}: ${consecutiveDays[employee]} days`);
      }
    }

    console.log('\nEmployees with less than 10 hours but more than 1 hour between shifts:');
    for (const employee in shortBreaks) {
      console.log(`${employee}: ${shortBreaks[employee] / (60 * 60 * 1000)} hours`);
    }

    console.log('\nEmployees who have worked for more than 14 hours in a single shift:');
    for (const employee in longShifts) {
      console.log(`${employee}: ${longShifts[employee] / (60 * 60 * 1000)} hours`);
    }
  });
