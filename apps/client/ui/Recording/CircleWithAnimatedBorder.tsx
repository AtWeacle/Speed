import styled, { keyframes } from 'styled-components'

const CIRCLE_SIZE = 34
const DURATION = 15

const animateStroke = keyframes`
  0% {
    stroke-dasharray: 0 ${Math.PI * (CIRCLE_SIZE - 10)};
  }
  100% {
    stroke-dasharray: ${Math.PI * (CIRCLE_SIZE - 10)} 0;
  }
`

const SvgWrapper = styled.div<{ $circleSize: string }>`
  display: inline-block;
  width: ${({ $circleSize }) => $circleSize}px;
  height: ${({ $circleSize }) => $circleSize}px;
`

const AnimatedCircle = styled.circle<{ $duration: string; }>`
  stroke: rgba(var(--color-red-rgb), 1);
  stroke-width: 2px;
  fill: none;
  animation: ${animateStroke} ${({ $duration }) => $duration}s linear infinite;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
`

export default function CircleWithAnimatedBorder({
  duration = DURATION,
  circleSize = CIRCLE_SIZE,
}: {
  duration?: number,
  circleSize?: number,
}) {
  return (
    <SvgWrapper $circleSize={circleSize.toString()}>
      <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
        <AnimatedCircle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={(CIRCLE_SIZE - 10) / 2}
          $duration={duration.toString()}
        />
      </svg>
    </SvgWrapper>
  )
}
