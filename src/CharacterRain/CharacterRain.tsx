import { useEffect, useRef, useState } from 'react';
import { useInterval } from '../hooks/useInterval';
import { DEFAULT_CHARS, MAX_DELAY_BETWEEN_STREAMS, MAX_INTERVAL_DELAY, MAX_STREAM_SIZE, MIN_DELAY_BETWEEN_STREAMS, MIN_INTERVAL_DELAY, MIN_STREAM_SIZE, STREAM_MUTATION_ODDS } from './constants';

const getRandInRange = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min)) + min;

const getRandChar = (str: string) => str.charAt(Math.floor(Math.random() * str.length));

const getRandStream = (charset: string) => new Array(getRandInRange(MIN_STREAM_SIZE, MAX_STREAM_SIZE)).fill(0).map(_ => getRandChar(charset));

function getMutatedStream(stream: string[], charset: string): string[] {
	const newStream = [];
	for (let i = 1; i < stream.length; i++) {
		if (Math.random() < STREAM_MUTATION_ODDS) {
			newStream.push(getRandChar(charset));
		} else {
			newStream.push(stream[i]);
		}
	}
	newStream.push(getRandChar(charset));
	return newStream;
};

interface RainStreamProps {
	charset?: string;
	height: number;
}

const RainStream = (props: RainStreamProps) => {
	const { charset = DEFAULT_CHARS, height } = props;
	const [stream, setStream] = useState<string[]>(getRandStream(charset));
	const [topPadding, setTopPadding] = useState(stream.length * -50);
	const [intervalDelay, setIntervalDelay] = useState<number | null>(null);

	// Initialize intervalDelay
	useEffect(() => {
		setTimeout(() => {
			setIntervalDelay(getRandInRange(MIN_INTERVAL_DELAY, MAX_INTERVAL_DELAY));
		}, getRandInRange(MIN_DELAY_BETWEEN_STREAMS, MAX_DELAY_BETWEEN_STREAMS));
	}, []);

	useInterval(() => {
		if (!height) return;

		if (!intervalDelay) return;

		// If stream is off the screen, reset it after timeout
		if (topPadding > height) {
			setStream([]);
			const newStream = getRandStream(charset);
			setStream(newStream);
			setTopPadding(newStream.length * -44);
			setIntervalDelay(null);
			setTimeout(
				() =>
					setIntervalDelay(getRandInRange(MIN_INTERVAL_DELAY, MAX_INTERVAL_DELAY)),
				getRandInRange(MIN_DELAY_BETWEEN_STREAMS, MAX_DELAY_BETWEEN_STREAMS),
			);
		} else {
			setTopPadding(topPadding + 44);
		}
		// setStream(stream => [...stream.slice(1, stream.length), getRandChar()]);
		setStream(getMutatedStream([...stream.slice(1, stream.length), getRandChar(charset)], charset));
	}, intervalDelay!);

	return (
		<div
			style={{
				fontFamily: 'matrixFont',
				color: '#20c20e',
				writingMode: 'vertical-rl',
				textOrientation: 'upright',
				userSelect: 'none',
				whiteSpace: 'nowrap',
				marginTop: topPadding,
				marginLeft: -15,
				marginRight: -15,
				textShadow: '0px 0px 8px rgba(32, 194, 14, 0.8)',
				fontSize: 50,
			}}>
			{stream.map((char, index) => (
				<a
					style={{
						marginTop: -12,
						// Reduce opacity for last chars
						opacity: index < 6 ? 0.1 + index * 0.15 : 1,
						color: index === stream.length - 1 ? '#fff' : undefined,
						textShadow: index === stream.length - 1 ? '0px 0px 20px rgba(255, 255, 255, 1)' : undefined,
					}}>
					{char}
				</a>
			))}
		</div>
	);
};

interface MatrixRainProps {
	width?: string | number;
	height: string | number;
}

const MatrixRain = (props: MatrixRainProps) => {
	// const { width, height } = props;
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState<{ width: number, height: number } | null>(null);

	useEffect(() => {
		const boundingClientRect = containerRef.current!.getBoundingClientRect();
		setContainerSize({
			width: boundingClientRect.width,
			height: boundingClientRect.height,
		});
	}, []);

	const streamCount = containerSize ? Math.floor(containerSize.width / 26) : 0;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				background: 'black',
				overflow: 'ignore',
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'center',
			}}
			ref={containerRef}>
			{new Array(streamCount).fill(0).map(_ => (
				<RainStream height={containerSize!.height} />
			))}
		</div>
	);
};

export default MatrixRain;