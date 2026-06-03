import React from "react"

export default function MockNextImage(props: any) {
  // Keep Next image calls simple in tests while preserving alt text and src.
  const { fill, priority, ...rest } = props
  return <img alt={props.alt ?? ""} {...rest} />
}
