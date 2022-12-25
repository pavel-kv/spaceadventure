// генерация случайных целых чисел из диапазона
export function randomInt(minValue = 0, maxValue = 1) {
	if (minValue > maxValue) {
		[minValue , maxValue] = [maxValue, minValue];
	}
	return Math.floor(Math.random() * ((maxValue) - (minValue) + 1)) + minValue;
}


// генерация случайных дробных чисел из диапазонаe
export function randomFloat(minValue, maxValue) {
	if (minValue > maxValue) {
		[minValue , maxValue] = [maxValue, minValue];
	}
	const minInt = parseInt(minValue * 100, 10);
	const maxInt = parseInt(maxValue * 100, 10);
	const randomInt = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
	return randomInt / 100;
}
