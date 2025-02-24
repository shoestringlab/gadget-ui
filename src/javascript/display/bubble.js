function Bubble(options = {}) {
	this.canvas = document.createElement('canvas')
	this.ctx = this.canvas.getContext('2d')
	this.configure(options)
	this.bubble = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		arrowPosition: 'topleft',
		arrowAngle: 315,
		text: '',
		padding: 10,
		fontSize: this.fontSize,
		fontStyle: this.fontStyle,
		fontWeight: this.fontWeight,
		fontVariant: this.fontVariant,
		font: this.font,
		color: this.color,
		borderWidth: this.borderWidth,
		borderColor: this.borderColor,
		backgroundColor: this.backgroundColor,
		justifyText: this.justifyText,
		lineHeight: this.lineHeight,
		align: this.align,
		vAlign: this.vAlign,
	}
}

Bubble.prototype.configure = function (options = {}) {
	this.color = options.color ?? '#000'
	this.borderWidth = options.borderWidth ?? 1
	this.borderColor = options.borderColor ?? '#000'
	this.backgroundColor = options.backgroundColor ?? '#f0f0f0'
	this.fontSize = options.fontSize ?? 14
	this.font = options.font ?? 'Arial'
	this.fontStyle = options.fontStyle ?? ''
	this.fontWeight = options.fontWeight ?? 100
	this.fontVariant = options.fontVariant ?? ''
	this.lineHeight = options.lineHeight ?? null
	this.align = options.align ?? 'center'
	this.vAlign = options.vAlign ?? 'middle'
	this.justifyText = options.justifyText ?? false
}

Bubble.prototype.events = ['rendered']

Bubble.prototype.setBubble = function (
	x,
	y,
	width,
	height,
	arrowPosition,
	length,
	angle
) {
	this.bubble.x = x
	this.bubble.y = y
	this.bubble.width = width
	this.bubble.height = height
	this.setArrow(arrowPosition, length, angle)
	this.calculateBoundingRect()
	const rect = this.getBoundingClientRect()
	this.canvas.height = rect.height
	this.canvas.width = rect.width
	document.body.appendChild(this.canvas)
}

Bubble.prototype.setText = function (text) {
	this.bubble.text = text
}

Bubble.prototype.setPosition = function (x, y) {
	this.bubble.x = x
	this.bubble.y = y
}

Bubble.prototype.setArrow = function (position, length, angle) {
	this.setArrowLength(length)
	this.setArrowPosition(position)
	this.setArrowAngle(angle)
	this.setArrowComponents()
	this.setArrowVector()
}

Bubble.prototype.setArrowPosition = function (position) {
	this.bubble.arrowPosition = position
	const { x, width, y, height } = this.bubble

	const positions = {
		top: [x + width / 2, y],
		topright: [x + width, y],
		right: [x + width, y + height / 2],
		bottomright: [x + width, y + height],
		bottom: [x + width / 2, y + height],
		bottomleft: [x, y + height],
		left: [x, y + height / 2],
		topleft: [x, y],
	}

	;[this.bubble.arrowX, this.bubble.arrowY] = positions[position] || [x, y]
}

Bubble.prototype.setArrowAngle = function (angle) {
	this.bubble.arrowAngle = angle
	const angleRanges = {
		top: [280, 360, 0, 80, 0],
		topright: [10, 80, 45],
		right: [10, 170, 90],
		bottomright: [100, 170, 180],
		bottom: [100, 260, 180],
		bottomleft: [190, 260, 225],
		left: [190, 350, 270],
		topleft: [280, 360, 0, 80, 315],
	}

	const range = angleRanges[this.bubble.arrowPosition] || [315]
	const isValid =
		range.length === 3
			? angle >= range[0] && angle <= range[1]
			: (angle >= range[0] && angle <= range[1]) ||
				(angle >= range[2] && angle <= range[3])

	if (!isValid) {
		console.error(
			`Angle must be within valid range for ${this.bubble.arrowPosition}`
		)
		this.bubble.arrowAngle = range[range.length - 1]
	}
}

Bubble.prototype.setArrowLength = function (length) {
	this.bubble.arrowLength = length
}

Bubble.prototype.setArrowComponents = function () {
	const angleInRadians =
		(Math.abs(this.bubble.arrowAngle - 90) * Math.PI) / 180
	this.bubble.arrowDx = Math.round(
		this.bubble.arrowLength * Math.cos(angleInRadians)
	)
	this.bubble.arrowDy = Math.round(
		this.bubble.arrowLength * Math.sin(angleInRadians)
	)
}

Bubble.prototype.setArrowVector = function () {
	const { arrowX, arrowY, arrowDx, arrowDy, arrowAngle } = this.bubble

	if (arrowAngle >= 0 && arrowAngle <= 90) {
		this.bubble.arrowEndX = arrowX + arrowDx
		this.bubble.arrowEndY = arrowY - arrowDy
	} else {
		this.bubble.arrowEndX = arrowX + arrowDx
		this.bubble.arrowEndY = arrowY + arrowDy
	}
}

Bubble.prototype.calculateBoundingRect = function () {
	const { borderWidth } = this.bubble
	const halfBorder = Math.floor(borderWidth / 2)

	this.bubble.top =
		Math.min(this.bubble.y, this.bubble.arrowEndY) - halfBorder
	this.bubble.left =
		Math.min(this.bubble.x, this.bubble.arrowEndX) - halfBorder
	this.bubble.right =
		Math.max(this.bubble.x + this.bubble.width, this.bubble.arrowEndX) +
		halfBorder
	this.bubble.bottom =
		Math.max(this.bubble.y + this.bubble.height, this.bubble.arrowEndY) +
		halfBorder
}

Bubble.prototype.getBoundingClientRect = function () {
	return {
		top: this.bubble.top,
		left: this.bubble.left,
		bottom: this.bubble.bottom,
		right: this.bubble.right,
		height: this.bubble.bottom - this.bubble.top,
		width: this.bubble.right - this.bubble.left,
	}
}

Bubble.prototype.render = function () {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

	this.ctx.fillStyle = this.bubble.backgroundColor
	this.ctx.strokeStyle = this.bubble.borderColor
	this.ctx.lineWidth = this.bubble.borderWidth

	const bubbleX = this.bubble.x
	const bubbleY = this.bubble.y

	this.ctx.beginPath()
	this.ctx.moveTo(bubbleX, bubbleY)
	this.ctx.lineTo(bubbleX, bubbleY + this.bubble.height)
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY + this.bubble.height)
	this.ctx.lineTo(bubbleX + this.bubble.width, bubbleY)
	this.ctx.lineTo(bubbleX, bubbleY)
	this.ctx.closePath()

	this.ctx.moveTo(this.bubble.arrowX, this.bubble.arrowY)
	this.ctx.lineTo(this.bubble.arrowEndX, this.bubble.arrowEndY)
	this.ctx.fill()
	this.ctx.stroke()

	this.ctx.fillStyle = this.bubble.color
	const config = {
		x: bubbleX + this.bubble.padding,
		y: bubbleY + this.bubble.padding,
		width:
			this.bubble.width -
			this.bubble.padding * 2 -
			this.bubble.borderWidth * 2,
		height:
			this.bubble.height -
			this.bubble.padding * 2 -
			this.bubble.borderWidth * 2,
		fontSize: this.bubble.fontSize,
		justify: this.bubble.justifyText,
		align: this.bubble.align,
		vAlign: this.bubble.vAlign,
		font: this.bubble.font,
		fontStyle: this.bubble.fontStyle,
		fontWeight: this.bubble.fontWeight,
		fontVariant: this.bubble.fontVariant,
		lineHeight: this.bubble.lineHeight,
	}
	gadgetui.util.drawText(this.ctx, this.bubble.text, config)
}

Bubble.prototype.attachToElement = function (selector, position) {
	const element = selector
	if (!element) return

	const rect = element.getBoundingClientRect()
	const canvasRect = this.canvas.getBoundingClientRect()

	const positions = {
		top: [rect.left + rect.width / 2, rect.top],
		topright: [rect.right, -this.bubble.padding],
		right: [rect.right, rect.top / 2 + rect.height / 2],
		bottomright: [rect.right, rect.bottom],
		bottom: [rect.left + rect.width / 2, rect.bottom],
		bottomleft: [rect.left - canvasRect.width, rect.bottom],
		left: [rect.left - canvasRect.width, rect.top - rect.height / 2],
		topleft: [rect.left - canvasRect.width, rect.top - canvasRect.height],
	}

	const [left, top] = positions[position] || [0, 0]
	this.canvas.style.left = `${left}px`
	this.canvas.style.top = `${top}px`
	this.canvas.style.position = 'absolute'
}

Bubble.prototype.destroy = function () {
	document.body.removeChild(this.canvas)
}
