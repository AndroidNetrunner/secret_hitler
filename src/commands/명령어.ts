
import { ICommand } from 'WOKCommands';
import { readyGame } from '../ready_game';
import { active_games } from '../state';

const command: ICommand = {
    category: 'joining',
    description: 'close joining',
    callback: () => {
        return `
?명령어 : 사용할 수 있는 모든 명령어를 출력합니다.
?시작 : 참가할 수 있는 게임을 만듭니다. 같은 채널에 이미 시작한 게임이 있다면 사용할 수 없습니다.
?참가 : 시작한 게임을 참가합니다. 시작한 게임이 존재하지 않거나 게임이 마감된 상태라면 사용할 수 없습니다.
?마감 : 참가를 마감하고 게임을 시작하기 위한 명령어입니다. 마감되지 않은 게임이 없다면 사용할 수 없습니다.
?리셋 : 진행 중인 게임을 초기화합니다. 새로운 게임을 시작할 수 있는 상태가 됩니다.
?트랙 : 현재 진행 중인 게임의 트랙 상황을 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.
?순서 : 대통령 후보가 이동하는 순서를 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.
?밸런스 : 인원 수에 따른 밸런스 패치 사항을 적용합니다. 한 번 더 실행하면 설정을 취소합니다.
?배후 : 배후 확장을 추가합니다. 한 번 더 실행하면 설정을 취소합니다.`
    }
}

export default command;