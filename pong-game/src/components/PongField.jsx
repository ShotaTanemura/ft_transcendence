import React, { useRef, useEffect, useState, useCallback } from 'react';

const PongField = ( {playerNames} ) => {
  const canvasRef = useRef(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const player1Name = playerNames[0];
  const player2Name = playerNames[1];

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      
      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the field
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the bars
      context.fillStyle = 'white';
      context.fillRect(10, 50, 10, 100); // Left bar
      context.fillRect(canvas.width - 20, 50, 10, 100); // Right bar
      
      // Draw the ball
      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
      context.fill();
      
      // Draw the scores and player names
      context.font = '30px Arial';
      context.fillText(player1Score, canvas.width / 4, 30);
      context.fillText(player2Score, 3 * canvas.width / 4, 30);
      context.font = '20px Arial';
      context.fillText(player1Name, canvas.width / 4, 60);
      context.fillText(player2Name, 3 * canvas.width / 4, 60);
    }
  }, [player1Score, player2Score]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default PongField;
