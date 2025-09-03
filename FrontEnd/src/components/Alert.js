import React from "react";

export default function Alert(props) {
  const capitalize = (word) => {
    let lower = word.toLowerCase();
    return lower[0].toUpperCase() + lower.slice(1);
  };
  let word;
  if (props.alert !== null) {
    word = props.alert.type;
    if (word === "danger") {
      word = "error";
    }
  }
  return (
    props.alert && (
      <div
        className={`fixed-bottom alert alert-${props.alert.type} alert-dismissible fade show`}
        role="alert"
      >
        <strong>{capitalize(word)}</strong> : {props.alert.msg}
      </div>
    )
  );
}
