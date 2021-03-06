import React from 'react'
import { CSSTransition } from 'react-transition-group'
import './transitions.css'

export const SlideTransition = props => {
  return <CSSTransition {...props} classNames="slide" timeout={300} />
}

export const ExpandTransition = props => {
  return <CSSTransition {...props} classNames="expand" timeout={500} />
}

export const FadeTransition = props => {
  return (
    <CSSTransition {...props} classNames="fade" timeout={500} unmountOnExit />
  )
}
