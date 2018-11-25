var possibleCombinationSum = (arr, n) => {
    if (arr.indexOf(n) >= 0) {
        return true;
    }
    if (arr[0] > n) {
        return false;
    }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length,
        combinationsCount = 1 << listSize;
    for (var i = 1; i < combinationsCount; i++) {
        var combinationSum = 0;
        for (var j = 0; j < listSize; j++) {
            if (i & (1 << j)) {
                combinationSum += arr[j];
            }
        }
        if (n === combinationSum) {
            return true;
        }
    }
    return false;
};

const Stars = props => {
    return (
        <div className="col-5">
            {_.range(props.count).map((element, i) => (
                <i key={i} className="fa fa-star" />
            ))}
        </div>
    );
};

const DoneFrame = props => {
    return (
        <div class="container text-center">
            <h2>{props.doneStatus}</h2>
            <button class="btn btn-secondary" onClick={props.reset}>
                Play Again
            </button>
        </div>
    );
};

const Button = props => {
    let button;
    switch (props.answerState) {
        case true:
            button = (
                <button class="btn btn-success" onClick={props.acceptAnswer}>
                    <i class="fa fa-check" />
                </button>
            );
            break;
        case false:
            button = (
                <button class="btn btn-danger">
                    <i class="fa fa-times" />
                </button>
            );
            break;
        default:
            button = (
                <button onClick={props.checkAnswer} class="btn" disabled={props.selectedNumbers.length === 0}>
                    =
                </button>
            );
    }

    return (
        <div class="col-2 text-center">
            {button}
            <br />
            <br />
            <button class="btn btn-warning" onClick={props.redraw} disabled={props.redraws === 0}>
                <i class="fa fa-refresh" />
                {props.redraws}
            </button>
        </div>
    );
};

const Result = props => {
    return (
        <div class="col-5">
            {props.selectedNumbers.map((element, i) => (
                <span key={i} onClick={() => props.deselectNumber(element)}>
                    {element}
                </span>
            ))}
        </div>
    );
};

const Numbers = props => {
    const numberClassName = number => {
        if (props.selectedNumbers.indexOf(number) >= 0) {
            return "selected";
        }
        if (props.usedNumbers.indexOf(number) >= 0) {
            return "used";
        }
        return "";
    };
    return (
        <div class="text-center card">
            <div>
                {Numbers.list.map((element, i) => (
                    <span key={i} onClick={event => props.selectNumber(element, event)} className={numberClassName(element)}>
                        {element}
                    </span>
                ))}
            </div>
        </div>
    );
};
Numbers.list = _.range(1, 10);

class Game extends React.Component {
    static random = () => Math.floor(9 * Math.random()) + 1;
    static getInitialState = () => ({
        selectedNumbers: [],
        starCount: Game.random(),
        answerState: null,
        usedNumbers: [],
        redraws: 5,
        doneStatus: null
    });

    state = Game.getInitialState();

    selectNumber = (number, event) => {
        if (!event.target.className.includes("selected") && !event.target.className.includes("used")) {
            this.setState(prevState => ({
                selectedNumbers: prevState.selectedNumbers.concat(number),
                answerState: null
            }));
        }
    };

    deselectNumber = number => {
        this.setState(prevState => ({
            answerState: null,
            selectedNumbers: prevState.selectedNumbers.filter(element => element !== number)
        }));
    };

    checkAnswer = () => {
        this.setState(prevState => ({
            answerState: prevState.starCount === prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
        }));
    };

    acceptAnswer = () => {
        this.setState(
            prevState => ({
                usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
                selectedNumbers: [],
                answerState: null,
                starCount: Game.random()
            }),
            this.updateDoneStatus
        );
    };

    redraw = () => {
        if (this.state.redraws === 0) {
            return;
        }
        this.setState(
            prevState => ({
                starCount: Game.random(),
                answerState: null,
                selectedNumbers: [],
                redraws: prevState.redraws - 1
            }),
            this.updateDoneStatus
        );
    };

    possibleSolutions = ({ usedNumbers, starCount }) => {
        const possibleNumbers = _.range(1, 10).filter(number => usedNumbers.indexOf(number) === -1);
        return possibleCombinationSum(possibleNumbers, starCount);
    };

    updateDoneStatus = () => {
        this.setState(prevState => {
            if (prevState.usedNumbers.length === 9) {
                return {
                    doneStatus: "Well done, you win!"
                };
            }
            if (!prevState.redraws && !this.possibleSolutions(prevState)) {
                return {
                    doneStatus: "Game Over!"
                };
            }
        });
    };

    reset = () => {
        this.setState(Game.getInitialState());
    };

    render() {
        const { selectedNumbers, usedNumbers, redraws, starCount, answerState, doneStatus } = this.state;
        return (
            <div class="container">
                <h3>Play Nine</h3>
                <hr />
                <div class="row">
                    <Stars count={starCount} />
                    <Button
                        selectedNumbers={selectedNumbers}
                        answerState={answerState}
                        redraws={redraws}
                        checkAnswer={this.checkAnswer}
                        acceptAnswer={this.acceptAnswer}
                        redraw={this.redraw}
                    />
                    <Result selectedNumbers={selectedNumbers} deselectNumber={this.deselectNumber} />
                </div>
                <br />
                {!this.state.doneStatus ? (
                    <Numbers selectedNumbers={selectedNumbers} usedNumbers={usedNumbers} selectNumber={this.selectNumber} />
                ) : (
                    <DoneFrame doneStatus={doneStatus} reset={this.reset} />
                )}
            </div>
        );
    }
}

class App extends React.Component {
    render() {
        return <Game />;
    }
}

ReactDOM.render(<App />, mountNode);
