import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

  // The Square

  function Square(props) {
        return (         
          <button className={`${props.winningSquares.includes(props.id)? 'winningSquare square': 'square'}`} onClick={props.onClick}>
            {props.value} 
          </button>         
        );
    }

  // The Board
  
  class Board extends React.Component {
    renderSquare(i, j) {
      return (
        <Square 
            value={this.props.squares[i]} 
            onClick={() => this.props.onClick(i, j)}
            key = {i}
            id = {i}
            winningSquares = {this.props.winningSquares}
        />
        );
    }

    // render board using loops and template literals

    renderBoard = () => {
      let renderedBoard = []
      let counter = 0
      for(let i = 1; i <= 3; i++){
        let children = []
        for(let j = 1; j <= 3; j++){
          children.push(this.renderSquare(counter, `(${i}, ${j})`))
          counter++;
        }     
        let rowNumber = counter/3;
        renderedBoard.push(<div key = {rowNumber} className="board-row">{children}</div>)
      }
      return renderedBoard;
    }

    render(){
      return(
        <div>
          {this.renderBoard()}
        </div>
      );
    }
  }

  // The Game
  
  class Game extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        history: [{
          squares: Array(9).fill(null),
          positions: []
        }],
        stepNumber: 0,
        xIsNext: true,
        active: 0,
        order: true,
        winningSquares: [],
      }
    }

    handleClick(i, j) {
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      // throw away "future" if we "go back in time" and make changes. Removes all history entries beyond current entry
      const current = history[history.length - 1];

      const positions = current.positions.slice();

      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]){
          return;
      }

      squares[i] = this.state.xIsNext ? 'X' : 'O';
      this.setState({ 
          history: history.concat([{
            squares: squares,
            positions: positions.concat(j)
          }]),
          stepNumber: history.length,
          xIsNext: !this.state.xIsNext,
          active: history.length,
          // new
          winningSquares: calculateWinner(squares) ? calculateWinner(squares): []
      });
    }

    // add active class to this function
    jumpTo(step) {    
      const myValue = calculateWinner(this.state.history[step].squares);
      this.setState({
        stepNumber: step,
        xIsNext: (step % 2) === 0,
        active: step,
        winningSquares: step === this.state.history.length - 1 && myValue? myValue : []
      })
    }

    changeOrder(){
      this.setState({order: !this.state.order})
    }
    
    render() {  
      const history = this.state.history;
      const current = history[this.state.stepNumber];
      const winner = calculateWinner(current.squares);
      const order = this.state.order;

      // step is current value while move is index
      // Normally, you would need to use 'step' for useful processing. 
      // However, in this specific case, only the index info 'move' 
      // is used to label the starting play differently and there 
      // is no use of 'step'.
      // HOWEVER there can be no index without an entry or 'step' first

      const moves = history.map((step, move) => {
        const desc = move ? 
          'Go to move #' + move :
          'Go to game start';
        const location = history[move].positions // go to relevant history array and retrive positions
        // alt : const location = history[move].positions[history[move].positions.length - 1]
        // history object being recreated each move? 1 for 1, 2 for 2, 3 for 3...
        return (
          <li key={move}>
            <button className={`${this.state.active === move ? 'active': ''}`} onClick={() => this.jumpTo(move)}>{desc} {location[location.length - 1]}</button> 
          </li>
        )
      });
      
      // sort according to state
      if(order){
        moves.sort((a, b) => b.key-a.key);
      } else {
        moves.sort((a, b) => a.key-b.key);
      }

      let status;
      if (winner) {
        status = `Winner: ${current.squares[winner[0]]}`;    
      } else if(this.state.history.length === 10 && this.state.stepNumber === 9) {
        status = "Draw!";
      } else {
        status = 'Next Player: ' + (this.state.xIsNext ? 'X' : 'O');
      }

      let moveOrder = 'Toggle Move Order ' + (this.state.order ? 'Asc.' : 'Desc.');
      return (
        <div className="game">
          <div className="game-board">
            <Board 
              squares={current.squares}
              onClick = {(i, j) => this.handleClick(i, j)}
              // new
              winningSquares = {this.state.winningSquares}
            />
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ol>
              <button onClick={() => this.changeOrder()} className="toggle">{moveOrder}</button>
              {moves}
            </ol>
          </div>        
        </div>        
      );
    }
  }
  
  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

  // Helper function

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return [a, b, c];
      }       
    }
    return null;
  }