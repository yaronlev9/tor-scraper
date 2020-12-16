import React from 'react';

function Paste(props) {
    const date = props.obj.date.split('T');
  return (
        <div className="paste">
            <div class="grid-container">
                <div class="title">
                    {props.obj.title}
                </div>
                <div class="content">
                    {props.obj.content}
                </div>
                <div class="author">
                    {props.obj.author}
                </div>
                <div class="date">
                    {`${date[0]}, ${date[1].split('.')[0]}`}
                </div>
            </div>
        </div>
  );
}

export default Paste;
