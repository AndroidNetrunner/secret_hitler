export const INVESTIGATE_LOYALTY = '소속 세력 확인';
export const CELL_SPECIAL_ELECTION = '대통령 후보 지명';
export const POLICY_PEEK = '정책 훔쳐보기';
export const EXECUTION = '처형';
export const FASCIST_WIN = '파시스트 승리';
export const BLANK = '없음';

type executiveAction = '소속 세력 확인' | '대통령 후보 지명' | '정책 훔쳐보기' | '처형' | '없음' | '파시스트 승리';
type fascistBoard = [executiveAction, executiveAction, executiveAction, executiveAction, executiveAction, executiveAction] 

interface ISettings {
    liberal: number,
    fascist: number,
    hitlerKnowsFascist: boolean
}

interface IroleByNumberOfPlayers {
    5: ISettings,
    6: ISettings,
    7: ISettings,
    8: ISettings,
    9: ISettings,
    10: ISettings 
}
 
interface IfascistBoard {
    5: fascistBoard,
    6: fascistBoard,
    7: fascistBoard,
    8: fascistBoard,
    9: fascistBoard,
    10: fascistBoard
}

export const roleByNumberOfPlayers : IroleByNumberOfPlayers = {
    5: {liberal: 3, fascist: 1, hitlerKnowsFascist: true},
    6: {liberal: 4, fascist: 1, hitlerKnowsFascist: true},
    7: {liberal: 4, fascist: 2, hitlerKnowsFascist: false},
    8: {liberal: 5, fascist: 2, hitlerKnowsFascist: false},
    9: {liberal: 5, fascist: 3, hitlerKnowsFascist: false},
    10: {liberal: 6, fascist: 3, hitlerKnowsFascist: false}
}

export const fascistBoard : IfascistBoard = {
    5: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    6: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    7: [BLANK, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    8: [BLANK, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    9: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    10: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN]
}