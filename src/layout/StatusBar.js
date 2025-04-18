import React, { useEffect } from 'react';
import { Layout, Row, Col, Space, Tag, Tooltip } from 'antd';

import PubSub from 'pubsub-js';
import { useTranslation } from "react-i18next";
const { Footer } = Layout;

const StatusBar = ({ hardwareInfo }) => {

    const { t } = useTranslation();
    const [realData, setRealData] = React.useState({
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkStatus: 'Disconnected',
    });

    const [modeInfo, setModeInfo] = React.useState('');
    const [msgInfo, setMsgInfo] = React.useState('');
    const [msg2Info, setMsg2Info] = React.useState('');
    const [msg3Info, setMsg3Info] = React.useState('');

    useEffect(() => {
        const token = PubSub.subscribe("normal-message-real-data", (_, data) => {

            //PubSub.unsubscribe(token);
            if (data.connectErr === false) {
                setRealData(data);

                /**
                 * 
                 * 0	開機 .. 自動變 1 或 5	1	初始化 … 自動變 2
2	待測模式	3	測試模式
4	回原點模式 (扭轉機)	5	保留(//系統錯誤顯示)
                 * 
                 */
                if (data.U65_MODE === 0) {
                    setModeInfo(t('Power On'));
                }
                else if (data.U65_MODE === 1) {
                    setModeInfo(t('Initialization'));
                }
                else if (data.U65_MODE === 2) {
                    setModeInfo(t('To Test Mode'));
                }
                else if (data.U65_MODE === 3) {
                    setModeInfo(t('Test Mode'));
                }
                else if (data.U65_MODE === 4) {
                    setModeInfo(t('Return Mode'));
                }


                /**
                 * 
                 * 0	停止 , 
1	等待 500MS ,  歸零 , 扣除毛重使用( RAM_PID[2]  PID[0] )
2	等待 扣除毛重完成
3	使用初速度 ( RAM_PID[3]  PID[0] )
4	等待（力量or 行程）到達初荷重 
5	到達初荷重(暫停/歸零../下夾具動作.. 改用測試速度RAM_PID[ 4] ..
檢查 DF_SET[0].IR_TYPE > 0 跳 20  , == 0 執行下一步
若是暫停 ,則 等待 人工命令 啟動馬達( 上or 下 ) 才會繼續
6	等待 停機起始點到達  & 監視 同步歸零
7	到達 停機起始點  , 記憶點數(HMI) , 監視 斷裂 ,停機 , 持壓 , 同步歸零 等等
8	切換測試速度2 ( RAM_PID[8]) .. 其他同上
	
    20-- 34 是 DF_SET[ ] 循環測試 …
20	循環初始點
21	DF_SET[n] 程序解碼 … 如果 IR_TYPE = 0 or 99, 跳到 29 
22	DF_SET[n] 指定歸零 , RAM_PID[ ]分配 , 起動
23	SIN等待 循環次數 或 循環時間到達
24	SIN停止 , 執行下一個 DF_SET[ n+1] 跳回 21 
25	ABS or INC 定位指令 執行完成 
26,27	等待 延遲時間 到達 , 跳到 24
28	等待 測試時間到達 DF_SET[ n+1] , 跳到 21 或 1
29	如果 IR_TYPE = 0 , 回步驟 6 ,  = 99 直接回步驟 99
30 --35	U70 設定 溫度 跟 溫升斜率
36	等待 力量 或 伸長 小於(<) 設定值
37	等待 力量 或 伸長 大於(>) 設定值
38	等待 溫度小於等於(<=) 設定值
39	等待 溫度大於等於(>=) 設定值
80 -- 83	暫停步驟 
	
99	紀錄斷裂 , 停止馬達
100	等待 500 MS … ,（上夾具下夾具）,回位 (RAM_PID[ 5] ..)
101	等待 回原點
102	到達原點 , 停機 ! （上夾具下夾具）
103	等待延遲 時間到達 or 使用 等待 人工命令啟動 回原點
104	回位 (RAM_PID[ 5] ..) , U65_MSG = 101
105	等待 回原點 ( 由 PC 監視  力量 < 設定 才停止 )
106	LT5000 等待 M1 回到原點
107	LT5000等待 M2 回到原點
108	LT5000等待 M3 回到原點
	
119	系統需要解鎖
                 * 
                 */
                if (data.U65_MSG === 0) {
                    setMsgInfo(t('Stop'));
                }
                else if (data.U65_MSG === 1) {
                    setMsgInfo(t('Waiting 500ms and Tare'));
                }
                else if (data.U65_MSG === 2) {
                    setMsgInfo(t('Waiting for Tare Complete'));
                }
                else if (data.U65_MSG === 3) {
                    setMsgInfo(t('Using Initial Speed'));
                }
                else if (data.U65_MSG === 4) {
                    setMsgInfo(t('Waiting for Initial Load'));
                }
                else if (data.U65_MSG === 5) {
                    setMsgInfo(t('Reached Initial Load'));
                }
                else if (data.U65_MSG === 6) {
                    setMsgInfo(t('Waiting for Stop Start Point & Sync Zero'));
                }
                else if (data.U65_MSG === 7) {
                    setMsgInfo(t('Arrived at Stop Start Point'));
                }
                else if (data.U65_MSG === 8) {
                    setMsgInfo(t('Switching to Test Speed 2'));
                }
                else if (data.U65_MSG === 20) {
                    setMsgInfo(t('Loop Start'));
                }
                else if (data.U65_MSG === 21) {
                    setMsgInfo(t('Decoding Loop Step'));
                }
                else if (data.U65_MSG === 22) {
                    setMsgInfo(t('Zeroing and Start'));
                }
                else if (data.U65_MSG === 23) {
                    setMsgInfo(t('Waiting for Loop Count/Time'));
                }
                else if (data.U65_MSG === 24) {
                    setMsgInfo(t('Loop Stop, Next Step'));
                }
                else if (data.U65_MSG === 25) {
                    setMsgInfo(t('Positioning Command Complete'));
                }
                else if (data.U65_MSG === 26 || data.U65_MSG === 27) {
                    setMsgInfo(t('Waiting for Delay'));
                }
                else if (data.U65_MSG === 28) {
                    setMsgInfo(t('Waiting for Test Time'));
                }
                else if (data.U65_MSG === 29) {
                    setMsgInfo(t('Jump Based on IR_TYPE'));
                }
                else if (data.U65_MSG === 30) {
                    setMsgInfo(t('Set Temperature/Slope'));
                }
                else if (data.U65_MSG === 31 || data.U65_MSG === 32 || data.U65_MSG === 33 || data.U65_MSG === 34 || data.U65_MSG === 35) {
                    setMsgInfo(t('Set Temperature/Slope'));
                }
                else if (data.U65_MSG === 36) {
                    setMsgInfo(t('Wait for Force/Displacement < Target'));
                }
                else if (data.U65_MSG === 37) {
                    setMsgInfo(t('Wait for Force/Displacement > Target'));
                }
                else if (data.U65_MSG === 38) {
                    setMsgInfo(t('Wait for Temp <= Target'));
                }
                else if (data.U65_MSG === 39) {
                    setMsgInfo(t('Wait for Temp >= Target'));
                }
                else if (data.U65_MSG >= 80 && data.U65_MSG <= 83) {
                    setMsgInfo(t('Pause Step'));
                }
                else if (data.U65_MSG === 99) {
                    setMsgInfo(t('Fracture Recorded, Motor Stopped'));
                }
                else if (data.U65_MSG === 100) {
                    setMsgInfo(t('Returning (500ms Delay)'));
                }
                else if (data.U65_MSG === 101) {
                    setMsgInfo(t('Waiting to Return to Origin'));
                }
                else if (data.U65_MSG === 102) {
                    setMsgInfo(t('Reached Origin, Stop'));
                }
                else if (data.U65_MSG === 103) {
                    setMsgInfo(t('Waiting for Manual Command to Return'));
                }
                else if (data.U65_MSG === 104) {
                    setMsgInfo(t('Returning...'));
                }
                else if (data.U65_MSG === 105) {
                    setMsgInfo(t('Waiting for Force < Target to Stop'));
                }
                else if (data.U65_MSG === 106) {
                    setMsgInfo(t('Waiting for M1 to Return'));
                }
                else if (data.U65_MSG === 107) {
                    setMsgInfo(t('Waiting for M2 to Return'));
                }
                else if (data.U65_MSG === 108) {
                    setMsgInfo(t('Waiting for M3 to Return'));
                }
                else if (data.U65_MSG === 119) {
                    setMsgInfo(t('System Unlock Required'));
                }
                else {
                    setMsgInfo(t('Unknown Status'));
                }



                /**
                 * 
                 * 0X0000	無
0X0001	第 1軸 伸長 超過 設定極限
0X0101	第 2軸 伸長 超過 設定極限
0X0201	第 3軸 伸長 超過 設定極限
0X0301	第 4軸 伸長 超過 設定極限
..	..
0X0002	第 1軸 力量 超過 設定極限
0X0102	第 2軸 力量 超過 設定極限
0X0202	第 3軸 力量 超過 設定極限
0X0302	第 4軸 力量 超過 設定極限
..	..
0X0004	無故停機… 力量 OVER ( 扭轉機 )
0X0005	L+ 
0X0006	L-
	
0X0010	力量 < 停機設定   ( 力量 or 伸長 )       
0X0011	到達設定時間 (PC_TEST_2.BREAK_UNIT = 3)
0 = MAX % , 1= SLOP % , 2=N , 3 = 時間(秒)
0X0012	力量 < 設定  ( N )  (PC_TEST_2.BREAK_UNIT = 2)
0X0013	斷裂成功 (MAX %)  (PC_TEST_2.BREAK_UNIT = 0)
0X0014	+ 斜率成功
0X0015	- 斜率成功
0X0016	持壓時間成立 結束
0X0017	循環指令(END_99)結束
0X0018	GT-7046HS 回原點超時 , 35秒內看不見 減速開關 …
0X0019	GT-7046HS 回原點超時 , 減速後 25秒內看不見 LIM+ …
0X001A	GT-7046HS 回原點超時 , 20秒內看不見 LIM+ 邊緣 …
0X001B	GT-7046HS 壓盤未下 不能測試 …
0X001C	GT-7046HS 沒有回原點 不能測試 …
0X001D	未知停止 , 可能是 測試中 遇到極限開關 …
0X001E	RH2000 平衡超時
0X001F	測試中 AD 產生撞擊保護
0X0020	測試中 撞擊 + 極限
0X0021	測試中 撞擊 - 極限
0XF000	使用者取消測試 (ABORT )
0XF001	U65_MODE測試模式遭到不明通訊變換  
0XF002	GT-7046HS安全開關動作 取消測試 (SAFITY_SW=1 )
0XF003	三角波 權限 不合法
                 * 
                 */
                switch (data.U65_MSG3) {
                    case 0x0000:
                        setMsg3Info(t('No Error'));
                        break;
                    case 0x0001:
                        setMsg3Info(t('Axis 1 Elongation Exceeds Limit'));
                        break;
                    case 0x0101:
                        setMsg3Info(t('Axis 2 Elongation Exceeds Limit'));
                        break;
                    case 0x0201:
                        setMsg3Info(t('Axis 3 Elongation Exceeds Limit'));
                        break;
                    case 0x0301:
                        setMsg3Info(t('Axis 4 Elongation Exceeds Limit'));
                        break;
                    case 0x0002:
                        setMsg3Info(t('Axis 1 Force Exceeds Limit'));
                        break;
                    case 0x0102:
                        setMsg3Info(t('Axis 2 Force Exceeds Limit'));
                        break;
                    case 0x0202:
                        setMsg3Info(t('Axis 3 Force Exceeds Limit'));
                        break;
                    case 0x0302:
                        setMsg3Info(t('Axis 4 Force Exceeds Limit'));
                        break;
                    case 0x0004:
                        setMsg3Info(t('Unexpected Stop: Force Overload (Torsion Machine)'));
                        break;
                    case 0x0005:
                        setMsg3Info(t('L+ Limit Triggered'));
                        break;
                    case 0x0006:
                        setMsg3Info(t('L- Limit Triggered'));
                        break;
                    case 0x0010:
                        setMsg3Info(t('Force Below Stop Threshold'));
                        break;
                    case 0x0011:
                        setMsg3Info(t('Test Time Reached (BREAK_UNIT = 3)'));
                        break;
                    case 0x0012:
                        setMsg3Info(t('Force Below Set Value (N)'));
                        break;
                    case 0x0013:
                        setMsg3Info(t('Break Success (MAX %)'));
                        break;
                    case 0x0014:
                        setMsg3Info(t('Positive Slope Success'));
                        break;
                    case 0x0015:
                        setMsg3Info(t('Negative Slope Success'));
                        break;
                    case 0x0016:
                        setMsg3Info(t('Hold Pressure Time Completed'));
                        break;
                    case 0x0017:
                        setMsg3Info(t('Loop Instruction (END_99) Completed'));
                        break;
                    case 0x0018:
                        setMsg3Info(t('GT-7046HS Homing Timeout: No Decel Switch in 35s'));
                        break;
                    case 0x0019:
                        setMsg3Info(t('GT-7046HS Homing Timeout: No LIM+ after Decel 25s'));
                        break;
                    case 0x001A:
                        setMsg3Info(t('GT-7046HS Homing Timeout: No LIM+ Edge in 20s'));
                        break;
                    case 0x001B:
                        setMsg3Info(t('GT-7046HS Upper Plate Not Down, Test Not Allowed'));
                        break;
                    case 0x001C:
                        setMsg3Info(t('GT-7046HS Not Homed, Test Not Allowed'));
                        break;
                    case 0x001D:
                        setMsg3Info(t('Unknown Stop: Possibly Hit Limit During Test'));
                        break;
                    case 0x001E:
                        setMsg3Info(t('RH2000 Balance Timeout'));
                        break;
                    case 0x001F:
                        setMsg3Info(t('Impact Protection Triggered During Test (AD)'));
                        break;
                    case 0x0020:
                        setMsg3Info(t('Impact + Limit During Test'));
                        break;
                    case 0x0021:
                        setMsg3Info(t('Impact - Limit During Test'));
                        break;
                    case 0xF000:
                        setMsg3Info(t('User Aborted Test'));
                        break;
                    case 0xF001:
                        setMsg3Info(t('U65_MODE Changed by Unknown Communication'));
                        break;
                    case 0xF002:
                        setMsg3Info(t('GT-7046HS Safety Switch Triggered, Test Aborted'));
                        break;
                    case 0xF003:
                        setMsg3Info(t('Triangle Wave Permission Invalid'));
                        break;
                    default:
                        setMsg3Info(t('Unknown'));
                }


            }
            else {
                //通讯失败
            }
        });
    }, []);



    return (
        <Footer style={{ background: '#f0f2f5', padding: '10px 50px', textAlign: 'center' }}>
            <Row gutter={24}>
                <Col span={6}>
                    <Space>
                        <Tooltip title="MODE">
                            <Tag color="blue">MODE: {realData.U65_MODE} {modeInfo}</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Tooltip title="MSG">
                            <Tag color="green">MSG: {realData.U65_MSG} {msgInfo}</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                <Col span={6}>
                    <Space>
                        <Tooltip title="MSG3">
                            <Tag color="orange">MSG3: {realData.U65_MSG3} {msg3Info}</Tag>
                        </Tooltip>
                    </Space>
                </Col>
                {/* <Col span={6}>
                    <Space>
                        <Tooltip title="MSG3">
                            <Tag color="purple">Network: {hardwareInfo.networkStatus}</Tag>
                        </Tooltip>
                    </Space>
                </Col> */}
            </Row>
        </Footer>
    );
};

export default StatusBar;
