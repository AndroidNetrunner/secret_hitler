export const INVESTIGATE_LOYALTY = '소속 세력 확인';
export const CALL_SPECIAL_ELECTION = '대통령 후보 지명';
export const POLICY_PEEK = '정책 훔쳐보기';
export const EXECUTION = '처형';
export const FASCIST_WIN = '파시스트 승리';
export const BLANK = '없음';

export const FASCIST = '파시스트';
export const LIBERAL = '자유당';
export const HITLER = '히틀러';
export const MASTERMIND = '배후';

export type Policy = '자유당' | '파시스트';
export type ExecutiveAction = '소속 세력 확인' | '대통령 후보 지명' | '정책 훔쳐보기' | '처형' | '없음' | '파시스트 승리';
export type FascistBoard = [ExecutiveAction, ExecutiveAction, ExecutiveAction, ExecutiveAction, ExecutiveAction, ExecutiveAction]
export type Role = '자유당' | '파시스트' | '히틀러' | '배후';

interface IroleByNumberOfPlayers {
    3: Role[],
    5: Role[],
    6: Role[],
    7: Role[],
    8: Role[],
    9: Role[],
    10: Role[],
}

interface IfascistBoard {
    3: FascistBoard,
    5: FascistBoard,
    6: FascistBoard,
    7: FascistBoard,
    8: FascistBoard,
    9: FascistBoard,
    10: FascistBoard
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
    3: [BLANK, CALL_SPECIAL_ELECTION, POLICY_PEEK, INVESTIGATE_LOYALTY, EXECUTION, FASCIST_WIN],
    5: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    6: [BLANK, BLANK, POLICY_PEEK, EXECUTION, EXECUTION, FASCIST_WIN],
    7: [BLANK, INVESTIGATE_LOYALTY, CALL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    8: [BLANK, INVESTIGATE_LOYALTY, CALL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    9: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CALL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN],
    10: [INVESTIGATE_LOYALTY, INVESTIGATE_LOYALTY, CALL_SPECIAL_ELECTION, EXECUTION, EXECUTION, FASCIST_WIN]
}