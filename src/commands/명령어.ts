
import { MessageEmbed } from 'discord.js';
import { ICommand } from 'WOKCommands';
import { readyGame } from '../ready_game';
import { active_games } from '../state';

const makeField = (name: string, value: string) => ({name, value});

const command: ICommand = {
    category: 'joining',
    description: '사용할 수 있는 모든 명령어를 출력합니다.',
    slash: true,
    callback: () => {
        const embed = new MessageEmbed()
        .setTitle('사용할 수 있는 명령어는 다음과 같습니다.')
        .addFields(
            makeField('/명령어', '사용할 수 있는 모든 명령어를 출력합니다.'),
            makeField('/시작', '참가할 수 있는 게임을 만듭니다. 같은 채널에 이미 시작한 게임이 있다면 사용할 수 없습니다.'),
            makeField('/참가', '시작된 게임에 참가합니다. 시작된 게임이 존재하지 않거나 게임이 마감된 상태라면 사용할 수 없습니다.'),
            makeField('/마감', '참가를 마감하고 게임을 시작합니다. 마감되지 않은 게임이 없다면 사용할 수 없습니다.'),
            makeField('/리셋', '진행 중인 게임을 초기화합니다. 새로운 게임을 시작할 수 있는 상태가 됩니다.'),
            makeField('/트랙', '현재 게임의 트랙 상황을 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.'),
            makeField('/순서', '대통령 후보가 이동하는 순서를 출력합니다. 진행 중인 게임이 없으면 사용할 수 없습니다.'),
            makeField('/밸런스', '인원 수에 따른 밸런스 패치 사항을 적용합니다. 한 번 더 실행하면 설정을 취소합니다.'),
            makeField('/배후', '배후 확장을 추가합니다. 한 번 더 실행하면 설정을 취소합니다.')
        )
        return embed;
    }
}

export default command;