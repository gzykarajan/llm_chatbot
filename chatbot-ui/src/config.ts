interface Config {
  welcomeMessage: string;
  botName: string;
  botAvatar: string;
  userAvatar: string;
  // 可以添加更多配置项
}

const config: Config = {
  welcomeMessage: "你好呀，心凌来回答你的问题哦❤️我有如下曲目哦：\n"+
                "- RR Model\n"+
                "- GS Model\n"+
                "- Bazin Model",
  botName: "暗夜精\"凌\"",
  botAvatar: "/avatars/bot-avatar.png",
  userAvatar: "/avatars/user-avatar.png"
};

export type { Config };
export default config; 
