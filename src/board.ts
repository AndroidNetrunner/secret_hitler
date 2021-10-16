export const INVESTIGATE_LOYALTY = '소속 세력 확인';
export const CELL_SPECIAL_ELECTION = '대통령 후보 지명';
export const POLICY_PEEK = '정책 훔쳐보기';
export const EXECUTION = '처형';
export const FASCIST_WIN = '파시스트 승리';
export const BLANK = '없음';

export const FASCIST = '파시스트';
export const LIBERAL = '자유당';
export const HITLER = '히틀러';

export type executiveAction = '소속 세력 확인' | '대통령 후보 지명' | '정책 훔쳐보기' | '처형' | '없음' | '파시스트 승리';
export type fascistBoard = [executiveAction, executiveAction, executiveAction, executiveAction, executiveAction, executiveAction]
export type role = '자유당' | '파시스트' | '히틀러';

interface IroleByNumberOfPlayers {
    3: role[],
    5: role[],
    6: role[],
    7: role[],
    8: role[],
    9: role[],
    10: role[],
}

interface IfascistBoard {
    3: fascistBoard,
    5: fascistBoard,
    6: fascistBoard,
    7: fascistBoard,
    8: fascistBoard,
    9: fascistBoard,
    10: fascistBoard
}

export const roleByNumberOfPlayers: IroleByNumberOfPlayers = {
    3: [FASCIST, HITLER, LIBERAL],
    5: [FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL],
    6: [FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL, LIBERAL],
    7: [FASCIST, FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL, LIBERAL],
    8: [FASCIST, FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL],
    9: [FASCIST, FASCIST, FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL],
    10: [FASCIST, FASCIST, FASCIST, HITLER, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL, LIBERAL],
}

export const fascistBoard: IfascistBoard = {
    3: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    5: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    6: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    7: [BLANK, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    8: [BLANK, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    9: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    10: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CELL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN]
}