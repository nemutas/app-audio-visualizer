// https://www.nti-audio.com/ja/%E3%82%B5%E3%83%9D%E3%83%BC%E3%83%88/%E6%B8%AC%E5%AE%9A%E3%83%8E%E3%82%A6%E3%83%8F%E3%82%A6/%E9%AB%98%E9%80%9F%E3%83%95%E3%83%BC%E3%83%AA%E3%82%A8%E5%A4%89%E6%8F%9B
// https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
// https://developer.mozilla.org/ja/docs/Web/HTML/Element/audio
// https://codepen.io/nfj525/pen/rVBaab
// https://natural-tearoom.com/video-rules/

import React, { useEffect, useRef, VFC } from 'react';
import { css } from '@emotion/css';

export const App: VFC = () => {
	const audioRef = useRef<HTMLAudioElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const analyserRef = useRef<AnalyserNode>()
	const animeIdRef = useRef<number>()
	const volumeRef = useRef(0.05)

	/**
	 * 曲を再生させたとき
	 */
	const playHandler = () => {
		if (!analyserRef.current) {
			const audioContext = new AudioContext()
			const src = audioContext.createMediaElementSource(audioRef.current!)
			const analyser = audioContext.createAnalyser()
			src.connect(analyser)
			analyser.connect(audioContext.destination)
			analyser.fftSize = 256
			analyserRef.current = analyser
		}

		audioRef.current!.volume = volumeRef.current

		const bufferLength = analyserRef.current!.frequencyBinCount
		const dataArray = new Uint8Array(bufferLength)

		canvasRef.current!.width = window.innerWidth
		canvasRef.current!.height = window.innerHeight
		const ctx = canvasRef.current!.getContext('2d')!

		renderFrame(ctx, dataArray)
	}

	/**
	 * フレーム毎にcanvasに描画する
	 * @param ctx
	 * @param dataArray
	 */
	function renderFrame(ctx: CanvasRenderingContext2D, dataArray: Uint8Array) {
		const WIDTH = ctx.canvas.width
		const HEIGHT = ctx.canvas.height
		const dataLength = dataArray.length
		// const barWidth = (WIDTH / dataLength) * 2.5
		const barWidth = WIDTH / dataLength
		let x = 0

		analyserRef.current!.getByteFrequencyData(dataArray)

		ctx.fillStyle = '#1e1e1e'
		ctx.fillRect(0, 0, WIDTH, HEIGHT)

		for (let i = 0; i < dataLength; i++) {
			const barHeight = dataArray[i]

			const r = barHeight + 25 * (i / dataLength)
			const g = 250 * (i / dataLength)
			const b = 50

			ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
			ctx.fillRect(x, HEIGHT / 2, barWidth, -barHeight)
			ctx.fillRect(x, HEIGHT / 2, barWidth, barHeight)

			x += barWidth + 1
		}

		animeIdRef.current = requestAnimationFrame(() => renderFrame(ctx, dataArray))
	}

	useEffect(() => {
		return () => {
			if (animeIdRef.current) {
				cancelAnimationFrame(animeIdRef.current)
			}
		}
	}, [])

	return (
		<div className={styles.container}>
			<canvas ref={canvasRef} className={styles.canvas} />
			<audio
				ref={audioRef}
				className={styles.player}
				controls
				loop
				src="./assets/たぬきちの冒険.mp3"
				onPlay={playHandler}
				onVolumeChange={() => (volumeRef.current = audioRef.current!.volume)}
			/>
		</div>
	)
}

// ==============================================
// styles

const styles = {
	container: css`
		position: relative;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	`,
	canvas: css`
		width: 100%;
		height: 100%;
	`,
	player: css`
		position: absolute;
		bottom: 20px;
	`
}
