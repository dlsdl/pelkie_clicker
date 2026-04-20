<template>
<div class="container">
    <div class="header-fixed" v-if="currentArea==1">
        <div class="header-text" style="font-size: 32px;">{{ t('tc_0') }} {{ format(peiCount) }} {{ t('tc_1') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(peiPerSecond) }}/{{ t('tc_5') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(peiPerClick) }}/{{ t('tc_6') }}</div>
    </div>
    <div class="header-fixed" v-if="currentArea==2">
        <div class="header-text" style="font-size: 32px;">{{ t('tc_0') }} {{ format(fosskie) }} {{ t('tc_2') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(fosskiePerSecond) }}/{{ t('tc_5') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(fosskiePerClick) }}/{{ t('tc_6') }}</div>
    </div>
    <div class="header-fixed" v-if="currentArea==4">
        <div class="header-text" style="font-size: 32px;">{{ t('tc_0') }} {{ format(starkie) }} {{ t('tc_3') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(starkiePerSecond) }}/{{ t('tc_5') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(starkiePerClick) }}/{{ t('tc_6') }}</div>
    </div>
    <div class="header-fixed" v-if="currentArea==5">
        <div class="header-text" style="font-size: 32px;">{{ t('tc_0') }} {{ format(dataKie) }} {{ t('tc_4') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(dataKiePerSecond) }}/{{ t('tc_5') }}</div>
        <div class="header-text" style="font-size: 20px;">{{ format(dataKiePerClick) }}/{{ t('tc_6') }}</div>
    </div>
    <div class="clickable pei-image" @click="clickPei" style="width: 200px; height: 200px; background-image: url('pelkie.bmp')">
        <div class="click-effects-container">
            <div v-for="(effect, index) in clickEffects"
                    :key="index"
                    :style="effect.style"
                    class="click-effect">
                +{{ format(effect.amount) }}
            </div>
        </div>
    </div>
    <div :class="goldenPeiVisible?'golden-pei clickable':'golden-pei-hide'" @click="clickGoldenPei" style="font-size:36px; text-align:center">♅</div>
    <div class="bonus-status">
        <div>{{ t('tc_7') }}: {{ format(milk) }}</div>
        <div>{{ t('tc_8') }}: {{ format(sugar) }}</div>
    </div>
    <div>{{ t('tc_9') }}: <span id="effectSpan">{{ t('tc_10') }}</span></div>
    <div class="tabs">
        <div v-for="(tab, index) in tabs" :key="index"
                v-show="showTab(index)"
                class="tab clickable"
                :class="{ 'active-tab': currentTab === index }"
                @click="currentTab = index">
            {{ t(`t${index}_0`) }}
        </div>
    </div>

    <!-- 建筑选项卡 -->
    <div v-if="currentTab === 0">
        <div class="bulk-selector">
            {{ t('t0_1') }}
            <select v-model="bulkAmount">
                <option value="1">×1</option>
                <option value="10">×10</option>
                <option value="100">×100</option>
                <option value="1000">×1000</option>
                <option value="10000">×10000</option>
                <option value="100000">×100000</option>
                <option value="1000000">×1000000</option>
            </select>
            <button @click="buyAllBuilding" v-show="ascensionCount.gte(1)">{{ t('t0_2') }}</button>
        </div>
        <div class="building-grid">
            <div class="divider">----------------------------------------------------------------</div>
            <div v-for="(building, index) in buildings" :key="index" class="building">
                &nbsp;&nbsp;{{ t('t0_3') }}{{ building.id + 1 }}&nbsp;&nbsp;<br />
                &nbsp;&nbsp;{{ t('t0_4') }}{{ formatInt(building.quantity) }}&nbsp;&nbsp;<br />
                &nbsp;&nbsp;{{ t('t0_5') }}{{ format(building.baseProd) }}&nbsp;&nbsp;<br />
                &nbsp;&nbsp;{{ t('t0_6') }}{{ format(building.production) }}&nbsp;&nbsp;
                <button @click="buyBuilding(index)"
                        :disabled="peiCount.lt(calcBulkCost(index))">
                    {{ t('t0_7') }}{{ bulkAmount }}<br />
                    {{ t('t0_8') }} {{ format(calcBulkCost(index)) }} {{ t('t0_9') }}
                </button>
            </div>
        </div>
    </div>

    <!-- 升级选项卡 -->
    <div v-if="currentTab === 1">
        <div style="font-size:24px">{{ t('t1_1') }} ({{ unlockedUpgradesCount }}/{{ upgrades.length }})</div>
        <div class="bulk-selector">
            <button @click="upgShowType = 1">{{ t('t1_2') }}</button>
            <button @click="upgShowType = 2">{{ t('t1_3') }}</button>
            <button @click="buyAllUpgrades" v-show="ascensionCount.gte(1)">{{ t('t1_4') }}</button>
        </div>
        <div class="upgrade-grid">
            <div class="divider">----------------------------------------------------------------</div>
            <template v-for="upgrade in upgrades" :key="upgrade.buildingId*100+upgrade.id">
            <div v-if="showUpgrade(upgrade)"
                    class="upgrade">
                <div>
                    {{ t('t1_5') }}{{ upgrade.buildingId }}-{{ upgrade.id }}
                    <span v-if="upgrade.buildingId==1 & upgrade.id<4">{{ t('t1_6') }}</span>
                    <span v-if="upgrade.buildingId==1 & upgrade.id==4">{{ t('t1_7') }}</span>
                    <span v-if="upgrade.buildingId==1 & upgrade.id>4 & upgrade.id<=20">{{ t('t1_8') }}</span>
                    <span v-if="upgrade.buildingId<100 & upgrade.buildingId>1 & upgrade.id<=20">{{ t('t1_9') }}{{upgrade.buildingId}}{{ t('t1_10') }}</span>
                    <span v-if="upgrade.buildingId<100 & upgrade.id>20">{{ t('t1_9') }}{{upgrade.buildingId}}{{ t('t1_11') }}{{format(Decimal.pow(buildings[upgrade.buildingId-1].baseCost,0.1).mul(upgrade.buildingId==1?1:1e3))}}{{ t('t1_12') }}{{(upgrade.id-20)*(upgrade.id-19)*1000}}{{ t('t1_13') }}{{upgrade.buildingId}}{{ t('t1_14') }}{{upgrade.buildingId}}{{ t('t1_15') }}</span>   
                    <span v-if="upgrade.buildingId==101">{{ t('t1_16') }}</span>
                    <span v-if="upgrade.buildingId==102">{{ t('t1_17') }}{{milkUpgradeBase[upgrade.id-1]*0.001.toFixed(3)}})</span>
                    <span v-if="upgrade.buildingId==103">{{ t('t1_19') }}{{upgrade.id+2}}{{ t('t1_20') }}{{upgrade.id}}{{ t('t1_21') }}</span>
                    <span v-if="upgrade.buildingId==104 & upgrade.id<6">{{ t('t1_22') }}{{Math.max(5,upgrade.id*25-25)}}%</span>
                    <span v-if="upgrade.buildingId==104 & upgrade.id>=6">{{ t('t1_24') }}{{Math.pow(10,upgrade.id-6)}}%</span>
                    <span v-if="upgrade.buildingId==105">{{ t('t1_26') }}{{Math.floor((upgrade.id-1)/10)+1}}%</span>
                    <span v-if="upgrade.buildingId==106">{{ t('t1_26') }}10{{ t('t1_27') }}{{upgrade.required}})</span>
                    <span v-if="upgrade.buildingId==107 & upgrade.id==1">{{ t('t1_29') }}</span>
                    <span v-if="upgrade.buildingId==107 & upgrade.id==2">{{ t('t1_30') }}</span>
                    <span v-if="upgrade.buildingId==107 & upgrade.id==3">{{ t('t1_31') }}</span>
                    <span v-if="upgrade.buildingId==107 & upgrade.id==4">{{ t('t1_32') }}</span>
                    <span v-if="upgrade.buildingId==108">{{ t('t1_33') }}{{upgrade.id+1}}{{ t('t1_34') }}{{upgrade.id+2}}{{ t('t1_35') }}{{upgrade.id+2}}{{ t('t1_36') }}{{(upgrade.id)%40+3}}{{ t('t1_37') }}</span>
                    <span v-if="upgrade.buildingId==109">{{ t('t1_38') }}{{upgrade.id}}{{ t('t1_39') }}{{upgrade.id+2}}{{ t('t1_40') }}{{upgrade.id+2}}{{ t('t1_41') }}{{(upgrade.id+1)%40+3}}{{ t('t1_42') }}</span>
                    <span v-if="upgrade.buildingId==110">{{ t('t1_43') }}{{milkUpgradeBase[upgrade.id-1]*0.001.toFixed(3)}})</span>
                </div>
                <button @click="buyUpgrade(upgrade.id, upgrade.buildingId)"
                        :disabled="!canBuyUpgrade(upgrade)">
                    {{ format(upgrade.cost.mul(upgradeCostMult)) }} {{ t('t1_45') }}
                </button>
            </div>
            </template>
        </div>
    </div>

    <!-- 成就选项卡 -->
    <div v-if="currentTab === 2">
        <div style="font-size:24px">{{ t('t2_1') }} ({{ unlockedAchievementsCount }}/{{ achievements.length }})</div>
        <div class="bulk-selector">
            <button @click="achShowType = 1">{{ t('t2_2') }}</button>
            <button @click="achShowType = 2">{{ t('t2_3') }}</button>
            <button @click="achShowType = 3">{{ t('t2_4') }}</button>
        </div>
        <div class="achievement-grid">
            <div class="divider">----------------------------------------------------------------</div>
            <div v-for="achievement in achievements" 
            :key="achievement.buildingId*100+achievement.id" 
            class="achievement" :class="{ 'unlocked': achievement.unlocked }"
            v-if="achShowType==1 || (achShowType==2 && achievement.unlocked) || (achShowType==3 && !achievement.unlocked)">
                <div class="achievement-info">
                    {{ achievement.unlocked ? '√' : '×' }} {{ t('t2_5') }}{{ achievement.buildingId }}-{{ achievement.id }}
                    <span v-if="achievement.buildingId<100">{{ t('t2_6') }}{{formatInt(achievement.required)}}{{ t('t2_7') }}{{achievement.buildingId}}</span>
                    <span v-if="achievement.buildingId==101">{{ t('t2_8') }}{{format(achievement.required)}}{{ t('t2_9') }}</span>
                    <span v-if="achievement.buildingId==102">{{ t('t2_10') }}{{format(achievement.required)}}{{ t('t2_11') }}</span>
                    <span v-if="achievement.buildingId==103">{{ t('t2_12') }}{{format(achievement.required)}}{{ t('t2_13') }}</span>
                    <span v-if="achievement.buildingId==104">{{ t('t2_14') }}{{format(achievement.required)}}{{ t('t2_15') }}</span>
                    <span v-if="achievement.buildingId==105">{{ t('t2_16') }}{{format(achievement.required)}}{{ t('t2_17') }}</span>
                    <span v-if="achievement.buildingId==106">{{ t('t2_18') }}{{format(achievement.required)}}{{ t('t2_19') }}</span>
                </div>
            </div>
        </div>
    </div>

    <!--传送门选项卡-->
    <div v-if="currentTab === 3">
        <div class="divider">----------------------------------------------------------------</div>
        <div>{{ t('t3_1') }}</div>
        <div class="upgrade-item">
            {{ t('t3_2') }} - {{format(peiCount)}} {{ t('t3_3') }} {{currentArea==1?t('t3_4'):""}}
            <button @click="currentArea = 1" :disabled="currentArea==1">
                {{ t('t3_5') }}
            </button>
        </div>
        <div class="upgrade-item">
            {{ t('t3_6') }} - {{format(fosskie)}} {{ t('t3_7') }} {{currentArea==2?t('t3_4'):""}}
            <button @click="currentArea = 2" :disabled="currentArea==2" v-if="this.hypercendU[2].level.gte(1)">
                {{ t('t3_5') }}
            </button>
            <span v-else>{{t('t3_8')}}</span>
        </div>
        <div class="upgrade-item">
            {{ t('t3_9') }} - {{format(starkie)}} {{ t('t3_10') }} {{currentArea==4?t('t3_4'):""}}
            <button @click="currentArea = 4" :disabled="currentArea==4" v-if="this.refineryU[2].level.gte(1)">
                {{ t('t3_5') }}
            </button>
            <span v-else>{{t('t3_11')}}</span>
        </div>
        <div class="upgrade-item">
            {{ t('t3_12') }} - {{format(datakie)}} {{ t('tc_4') }} {{currentArea==5?t('t3_4'):""}}
            <button @click="currentArea = 5" :disabled="currentArea==5" v-if="challenges[4].completedTimes.gte(1) && antsDriven.gte(1e10)">
                {{ t('t3_5') }}
            </button>
            <span v-else>{{ t('t34_12') }}</span>
        </div>
        <div class="upgrade-item">
            {{ t('t3_13') }} {{currentArea==3?t('t3_4'):""}}
            <button @click="currentArea = 3" :disabled="currentArea==3" v-if="this.hypercendU[5].level.gte(1) || this.spaceResetCount.gte(1)">
                {{ t('t3_5') }}
            </button>
            <span v-else>{{t('t3_14')}}</span>
        </div>
        <div class="upgrade-item">
            {{ t('t3_15') }}
        </div>
    </div>

    <!-- 飞升选项卡 -->
    <div v-if="currentTab === 4">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="canAscend">
            <p>{{ t('t4_1') }}{{ format(this.totalShards.sub(this.totalRealityShards).max(0)) }}{{ t('t4_2') }}{{format(nextShards)}}{{ t('t4_3') }}</p>
            <button @click="ascend" style="padding:5px 20px" :disabled="this.totalShards.sub(this.totalRealityShards).lte(0)">{{ t('t4_4') }}</button>
        </div>
        <div v-else>
            <p>{{ t('t4_5') }}{{ format(totalLifetimePei) }}{{ t('t4_6') }}</p>
        </div>
        <div v-if="this.ascensionCount.gte(1)" class="shop">
            <h4>{{ t('t4_7') }}{{ format(realityShards) }}/{{format(totalRealityShards)}}{{ t('t4_9') }}</h4>
            <div class="bulk-selector">
                <button @click="buyAllAscendU" v-show="ascensionCount.gte(1)">{{ t('t4_10') }}</button>
                <button @click="refundAscendU">{{ t('t4_11') }}</button>
            </div>
            <div v-for="upgrade in ascendU" :key="upgrade.id" class="upgrade-item">
                {{t('au_'+(upgrade.id-1))}}<br />
                {{ t('t4_12') }}{{ formatInt(upgrade.level) }}/{{ formatInt(upgrade.maxLevel) }}
                <button @click="buyAscendU(upgrade.id-1)"
                        :disabled="realityShards.lt(upgrade.cost) || upgrade.level.gte(upgrade.maxLevel)">
                    {{ format(upgrade.cost) }}{{ t('t4_14') }}
                </button>
                <button v-show="ascendU[8].level.gte(1) & upgrade.id==9" @click="switchGolden">
                    {{ t('t4_15') }}{{enableGolden?t('t4_16'):t('t4_17')}}
                </button>
                <button v-show="ascendU[16].level.gte(1) & upgrade.id==17" @click="switchClick">
                    {{ t('t4_18') }}{{enableClick?t('t4_16'):t('t4_17')}}
                </button>
            </div>
        </div>
        <div v-else class="shop">
            <p>{{ t('t4_19') }}</p>
        </div>
    </div>

    <!-- 轮回选项卡 -->
    <div v-if="currentTab === 5">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="canTranscend">
            <p>{{ t('t5_1') }}{{ format(this.totalTP.sub(this.totalTranscendPoints).max(0)) }}{{ t('t5_2') }}{{format(nextTP)}}{{ t('t5_3') }}</p>
            <button @click="transcend" style="padding:5px 20px" :disabled="this.totalTP.sub(this.totalTranscendPoints).lte(0)">{{ t('t5_4') }}</button>
        </div>
        <div v-else>
            <p>{{ t('t5_5') }}{{ format(totalRealityShards) }}{{ t('t5_6') }}</p>
        </div>
        <div v-if="this.transcensionCount.gte(1)" class="shop">
            <div>{{ t('t5_7') }}{{format(transcendBonus)}}</div>
            <h4>{{ t('t5_8') }}{{ format(transcendPoints) }}/{{ format(totalTranscendPoints) }}{{ t('t5_10') }}</h4>
            <div class="bulk-selector">
                <button @click="buyAllTranscendU" v-show="breakCount.gte(1)">{{ t('t5_11') }}</button>
                <button @click="refundTranscendU">{{ t('t5_12') }}</button>
            </div>
            <template v-for="upgrade in transcendU" :key="upgrade.id">
            <div v-if="upgrade.id<=12" class="upgrade-item">
                {{t('tu_'+(upgrade.id-1))}}<br />
                {{ t('t5_13') }}{{ formatInt(upgrade.level) }}{{ t('t5_14') }}
                <button @click="buyTranscendU(upgrade.id-1)" 
                        :disabled="transcendPoints.lt(upgrade.cost)">
                    {{ format(upgrade.cost) }}{{ t('t5_15') }}
                </button>
            </div>
            </template>
            <p>{{ t('t5_16') }}</p>
            <template v-for="upgrade in transcendU" :key="'b'+upgrade.id">
            <div v-if="upgrade.id>=13" class="upgrade-item">
                {{t('tu_'+(upgrade.id-1))}}<br />
                {{ t('t5_13') }}{{ formatInt(upgrade.level) }}/{{upgrade.maxLevel}}
                <button @click="buyTranscendU(upgrade.id-1)" 
                        :disabled="transcendPoints.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)">
                    {{ format(upgrade.cost) }}{{ t('t5_15') }}
                </button>
            </div>
            </template>
        </div>
        <div v-else class="shop">
            <p>{{ t('t5_18') }}</p>
        </div>
    </div>

    <!-- 破碎选项卡 -->
    <div v-if="currentTab === 6">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if=canBreak>
            <p>{{ t('t6_1') }}</p>
            <button @click="doBreak" style="padding:5px 20px">{{ t('t6_2') }}</button>
        </div>
        <div v-else>
            <p>{{ t('t6_3') }}{{format(nextBreak)}}{{ t('t6_4') }}{{ format(totalTranscendPoints) }}/{{format(nextBreak)}})</p>
        </div>
        <div v-if="this.breakCount.gte(1)" class="shop">
            <h4>{{ t('t6_7') }}{{ formatInt(this.breakCount) }}{{ t('t6_8') }}</h4>
            <div v-for="i in 16" class="upgrade-item" :class="{ 'unlocked': breakCount.gte(i<=8?i:i<=12?i*8-56:i*250-3000) }">
                {{ t('t6_9') }}{{i<=8?i:i<=12?i*8-56:i*250-3000}}{{ t('t6_10') }}<br />
                {{t('bm_'+(i-1))}}
            </div>
        </div>
        <div v-else class="shop">
            <p>{{ t('t6_11') }}</p>
        </div>
    </div>

    <!-- 觉醒选项卡 -->
    <div v-if="currentTab === 7">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="canHypercend">
            <p>{{ t('t7_1') }}{{format(this.HPGain)}}{{ t('t7_2') }}</p>
            <button @click="hypercend" style="padding:5px 20px">{{ t('t7_3') }}</button>
        </div>
        <div v-else>
            <p>{{ t('t7_4') }}{{ formatInt(breakCount) }}{{ t('t7_5') }}{{ format(totalLifetimePei) }}{{ t('t7_6') }}</p>
        </div>
        <div v-if="this.hypercendCount.gte(1)" class="shop">
            <div>
                {{ t('t7_7') }}{{format(this.hypercendPoints)}}{{ t('t7_8') }}{{format(this.totalHypercendPoints)}}{{ t('t7_9') }}{{format(this.maxHypercendPoints)}}{{ t('t7_10') }}
            </div>
            <h4>{{ t('t7_11') }}</h4> 
            <div v-for="upgrade in hypercendU" :key="upgrade.id" class="upgrade-item">
                {{t('hu_'+(upgrade.id-1))}}<br />
                {{ t('t7_12') }}{{ formatInt(upgrade.level) }}/{{ upgrade.maxLevel }}
                <button @click="buyHypercendU(upgrade.id-1)"
                        :disabled="hypercendPoints.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)">
                    {{ format(upgrade.cost) }}{{ t('t7_14') }}
                </button>
                <button @click="buyMaxHypercendU(upgrade.id-1)">
                    {{ t('t7_15') }}
                </button>
            </div>
        </div>
        <div v-else class="shop">
            <p>{{ t('t7_16') }}</p>
        </div>
    </div>

    <!-- 自动化选项卡 -->
    <div v-if="currentTab === 8">
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t8_1') }}</h4>
        <template v-for="upgrade in automation" :key="upgrade.id">
        <div v-if="upgrade.id<=((cinnamonResetCount.gte(1) && vanillaResetCount.gte(1))?30:nobreakRecord.gte('1e30000')?24:sweetenCount.gte(1)?18:hypercendU[4].level.gte(1)?14:9)" class="upgrade-item">
            {{t('auto_'+(upgrade.id-1))}}<br />
            <button @click="buyAuto(upgrade.id-1)" :disabled="upgrade.unlocked">
                {{ t('t8_2') }}{{format(upgrade.cost)}}{{ t('t8_3') }}
            </button>
            <button @click="toggleAuto(upgrade.id-1)" :disabled="!upgrade.unlocked">
                {{upgrade.activate?t('t8_4'):t('t8_5')}}
            </button>
        </div>
        </template>
    </div>

    <!-- 充能选项卡 -->
    <div v-if="currentTab === 9">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="hypercendU[0].level.gte(1)">
            {{ t('t9_1') }}{{format(hyperCharge)}}{{ t('t9_2') }}{{format(HCProduction)}}{{ t('t9_3') }}{{format(hyperEffect(0))}}{{ t('t9_4') }}<br />
            <h4>{{ t('t9_5') }}</h4>
            <template v-for="upgrade in hyperChargeU" :key="upgrade.id">
            <div v-if="upgrade.id<=(condenseryU[1].gte1?24:refineryU[1].level.gte(1)?20:16)" class="upgrade-item">
                {{ t('t9_6') }}{{upgrade.id}}{{ t('t9_7') }}{{t('hc_'+(upgrade.id-1))}}<br />
                {{ t('t9_8') }}{{format(hyperEffect(upgrade.id))}}<br />
                <button @click="buyHyperChargeU(upgrade.id-1)" 
                        :disabled="hypercendPoints.lt(upgrade.cost)">
                    {{upgrade.unlocked?t('t9_9'):t('t9_10')+format(upgrade.cost)+t('t9_11')}}<br />
                </button>
            </div>
            </template>
        </div>
        <div v-else>
            {{ t('t9_12') }}
        </div>
    </div>

    <!-- 统计选项卡 -->
    <div v-if="currentTab === 10">
        <h3>{{ t('t10_1') }}</h3>
        <div>{{ t('t10_2') }} {{format(peiCount)}}</div>
        <div>{{ t('t10_3') }} {{format(thisAscendPei)}}</div>
        <div>{{ t('t10_4') }} {{format(totalLifetimePei)}}</div>
        <div>{{ t('t10_5') }} {{format(peiPerSecond)}}</div>
        <div>{{ t('t10_6') }} {{format(totalClickPei)}}</div>
        <div>{{ t('t10_7') }} {{format(peiPerClick)}}</div>
        <div>{{ t('t10_8') }} {{goldenPeiClick}}</div>
        <div>{{ t('t10_9') }} {{format(ascensionCount)}}</div>
        <div>{{ t('t10_10') }} {{format(realityShards)}}</div>
        <div>{{ t('t10_11') }} {{format(totalRealityShards)}}</div>
        <div>{{ t('t10_12') }} {{format(transcensionCount)}}</div>
        <div>{{ t('t10_13') }} {{format(transcendPoints)}}</div>
        <div>{{ t('t10_14') }} {{format(totalTranscendPoints)}}</div>
        <div>{{ t('t10_15') }} {{format(hypercendCount)}}</div>
        <div>{{ t('t10_16') }} {{format(hypercendPoints)}}</div>
        <div>{{ t('t10_17') }} {{format(totalHypercendPoints)}}</div>
        <div>{{ t('t10_18') }} {{Math.floor(this.goldenPeiTimer)}}/{{this.goldenPeiTimeCap.toFixed(0)}}</div>
        <div>{{ t('t10_20') }} {{ Math.floor(playTime) }}/{{this.sugarTimeCap.toFixed(0)}}</div>
        <div>{{ t('t10_21') }} {{ format(milkBonus) }}</div>
        <div>{{ t('t10_22') }} {{ format(sugarBonus) }}</div>
        <div>{{ t('t10_23') }} {{ format(upgradeBonus) }}</div>
        <div>{{ t('t10_24') }} {{ format(ascendBonus) }}</div>
        <div>{{ t('t10_25') }} {{ format(transcendBonus) }}</div>
        <div>{{ t('t10_26') }} {{ format(breakBonus) }}</div>
        <div>{{ t('t10_27') }} {{ format(hypercendBonus) }}</div>
        <!-- 原有统计信息... -->
    </div>

    <!-- 杂项选项卡 -->
    <div v-if="currentTab === 11">
        <button @click="saveGame()">{{ t('t11_0') }}</button>
        <button @click="loadGame()">{{ t('t11_1') }}</button>
        <button @click="hardReset()" style="color:red">{{ t('t11_2') }}</button>
        <button @click="toggleLanguage()">{{ t('t11_35') }}</button>
        <div>
            {{ t('t11_3') }}<br />
            {{ t('t11_4') }}<br />
            {{ t('t11_5') }}<br />
            {{ t('t11_6') }}
            {{ t('t11_9') }}<br />拜谢<br />
            {{ t('t11_10') }}<br />
            {{ t('t11_11') }}<br />
            {{ t('t11_12') }}<br />
            {{ t('t11_13') }}<br /><br />
            {{ t('t11_14') }}<br />
            {{ t('t11_15') }}<br />
            {{ t('t11_16') }}<br />
            {{ t('t11_17') }}<br />
            {{ t('t11_18') }}<br />
            {{ t('t11_19') }}<br />
            {{ t('t11_20') }}<br />
            {{ t('t11_21') }}<br />
            {{ t('t11_22') }}<br />
            {{ t('t11_23') }}<br />
            {{ t('t11_24') }}<br />
            {{ t('t11_25') }}<br />
            {{ t('t11_26') }}<br />
            {{ t('t11_27') }}<br />
            {{ t('t11_28') }}<br />
            {{ t('t11_29') }}<br />
            {{ t('t11_30') }}<br />
            {{ t('t11_31') }}<br />
            {{ t('t11_32') }}<br />
            {{ t('t11_33') }}<br />
            {{ t('t11_34') }}<br />
        </div>
    </div>

    <div v-if="currentTab === 12">
        <div>
            {{ t('t12_1') }} 
            {{ t('t12_2') }}<br />
            {{ t('t12_3') }}
            {{ t('t12_4') }}<br />
            {{ t('t12_5') }}<br />
            <br />
            {{ t('t12_6') }}<br />
            {{ t('t12_7') }}<br />
            {{ t('t12_8') }}<br />
            {{ t('t12_9') }}<br />
            <br />
            {{ t('t12_10') }} {{format(fosskie)}}<br />
            {{ t('t12_11') }} {{format(totalFosskie)}}<br />
            {{ t('t12_12') }} {{format(resetFosskie)}}<br />
            {{ t('t12_13') }} {{format(icing)}}<br />
            {{ t('t12_14') }} {{format(totalIcing)}}<br />
            {{ t('t12_15') }} {{format(honey)}}<br />
            {{ t('t12_16') }} {{format(totalHoney)}}<br />
            {{ t('t12_17') }} {{format(caramel)}}<br />
            {{ t('t12_18') }} {{format(totalCaramel)}}<br />
        </div>
    </div>

    <!--中生代山谷选项卡-->
    <div v-if="currentTab === 13" class="building-grid">
        <div class="divider">----------------------------------------------------------------</div>
        <div>{{ t('t13_1') }}</div>
        <div>{{ t('t13_2') }}</div>
        <div>{{ t('t13_3') }}{{format(totalFosskie)}}</div>
        <div>{{ t('t13_4') }}{{format(this.totalFosskie.div(65536).add(1).pow(0.25))}}</div>
        <div class="bulk-selector">
            {{ t('t13_5') }}:
            <select v-model="bulkLifeAmount">
                <option value="1">×1</option>
                <option value="10">×10</option>
                <option value="100">×100</option>
                <option value="1000">×1000</option>
            </select>
        </div>
        <template v-for="(p, index) in peiLives" :key="index">
        <div v-if="index<27" class="pei-life">
            佩干生命{{ p.id }} - {{index%3==0?"草食":index%3==1?"肉食":"杂食"}}，{{index/3%3<1?"水生":index/3%3<2?"陆生":"两栖"}}，{{index/9%3<1?"小型":index/9%3<2?"中型":"大型"}} - {{p.progress.toFixed(1)}}/{{p.duration.toFixed(1)}}s<br />
            数量：{{p.level}} 基础产量：{{format(p.baseProd)}} 产量：{{format(calcLifeProd(index))}}<br />
            产量×{{format(calcLifeMult(index))}} 速度×{{format(calcSpeedMult(index))}} 价格÷{{format(calcCostMult(index))}}<br />
        <button @click="buyPeiLife(index, bulkLifeAmount)" :disabled="fosskie.lt(calcLifeBulkCost(index, bulkLifeAmount))">
            购买×{{bulkLifeAmount}}花费<br /> {{ format(calcLifeBulkCost(index, bulkLifeAmount)) }}
        </button>
        <button @click="unlockLifeAuto(index)" :disabled="p.level.lte(0) | fosskie.lt(p.baseCost.mul(10))">
            <div v-if="!p.auto">解锁自动生产<br />{{ format(p.baseCost.mul(10)) }}</div>
            <div v-else>已解锁<br />自动生产</div>
        </button>
        <button @click="startLifeProd(index)" :disabled="p.level.lte(0)">
            开始<br />生产
        </button>
        <div class="progress-bar">
            <div :style="{ width: p.progress/p.duration*100 + '%' }"></div>
        </div>
        </div>
        </template>
        <div class="pei-life" v-if="refineryU[4].level.gte(1)">
            佩干生命28 - 进化的终极形态 - {{peiLives[27].progress.toFixed(1)}}/9e15s<br />
            数量：{{peiLives[27].level}} 基础产量：{{format(peiLives[27].baseProd)}} 产量：{{format(calcLifeProd(27))}}<br />
            产量×{{format(calcLifeMult(27))}} 速度×{{format(calcSpeedMult(27))}} 价格÷{{format(calcCostMult(27))}}<br />
        <button @click="buyPeiLife(27, bulkLifeAmount)" :disabled="fosskie.lt(calcLifeBulkCost(27, bulkLifeAmount))">
            购买×{{bulkLifeAmount}}花费<br /> {{ format(calcLifeBulkCost(27, bulkLifeAmount)) }}
        </button>
        <button @click="unlockLifeAuto(27)" :disabled="peiLives[27].level.lte(0) | fosskie.lt(peiLives[27].baseCost.mul(10))">
            <div v-if="!peiLives[27].auto">解锁自动生产<br />{{ format(peiLives[27].baseCost.mul(10)) }}</div>
            <div v-else>已解锁<br />自动生产</div>
        </button>
        <button @click="startLifeProd(27)" :disabled="peiLives[27].level.lte(0)">
            开始<br />生产
        </button>
        <div class="progress-bar">
            <div :style="{ width: peiLives[27].progress/peiLives[27].duration*100 + '%' }"></div>
        </div>
        </div>
    </div>

    <!--中生代山谷重置-->
    <div v-if="currentTab === 14">
        <div class="divider">----------------------------------------------------------------</div>
            <div v-if="resetFosskie.gte(1e12)">
            <p>{{ t('t14_1') }} {{format(icingGain)}} {{ t('t14_3') }}</p>
            <button @click="icingReset" style="padding:5px 20px">{{ t('t14_4') }}</button>
            </div>
            <div v-else>
            {{ t('t14_5') }}<br />
            {{format(resetFosskie)}}/1e12
            </div>
            <div v-if="resetFosskie.gte(1e48)" class="shop">
            <p>{{ t('t14_6') }} {{format(honeyGain)}} {{ t('t14_8') }}</p>
            <button @click="honeyReset" style="padding:5px 20px">{{ t('t14_9') }}</button>
            </div>
            <div v-else class="shop">
            {{ t('t14_10') }}<br />
            {{format(resetFosskie)}}/1e48
            </div>
            <div v-if="spaceResetCount.gte(1)">
            <div v-if="resetFosskie.gte(nextSweeten)" class="shop">
            <p>{{ t('t14_11') }}</p>
            <button @click="sweetenReset" style="padding:5px 20px">{{ t('t14_13') }}</button>
            </div>
            <div v-else class="shop">
            {{ t('t14_14') }}{{format(nextSweeten)}}{{ t('t14_15') }}<br />
            {{format(resetFosskie)}}/{{format(nextSweeten)}}
            </div>
            <div v-if="resetFosskie.gte(1e308) & sweetenCount.gte(8)" class="shop">
            <p>{{ t('t14_16') }} {{format(caramelGain)}} {{ t('t14_18') }}</p>
            <button @click="caramelReset" style="padding:5px 20px">{{ t('t14_19') }}</button>
            </div>
            <div v-else class="shop">
            {{ t('t14_20') }}<br />
            {{formatInt(sweetenCount)}}/8 {{format(resetFosskie)}}/1e308
            </div>
        </div>
    </div>


    <div v-if="currentTab === 15">
        <div class="divider">----------------------------------------------------------------</div>
        <div>
            {{ t('t12_13') }} {{format(icing)}}<br />
            {{ t('t12_15') }} {{format(honey)}}<br />
            {{ t('t12_17') }} {{format(caramel)}}<br />
            <p>{{ t('t15_1') }}</p>
            <template v-for="(tr, index) in traits" :key="'a'+index">
            <div v-if="index<27" class="pei-life">
                {{ t('t15_2') }}{{index+1}}: {{ t('t15_3') }}{{index+1}}{{ t('t15_4') }}<br />
                {{ t('t15_5') }}：{{tr.level}}，{{ t('t15_6') }}：×{{format(Decimal.pow(2,tr.level))}}<br />
                <button @click="buyTrait(index)" :disabled="totalIcing.lte(0)">{{ t('t15_7') }}{{format(tr.cost)}}{{ t('t15_8') }}</button>
            </div>
            </template>
            <p>{{ t('t15_9') }}</p>
            <template v-for="(tr, index) in traits" :key="'b'+index">
            <div v-if="index>=27 & index<39" class="pei-life">
                {{ t('t15_10') }}{{index+1}}: {{ t('t15_11') }}{{t('trait_'+(index-27))}}<br />
                {{ t('t15_5') }}：{{tr.level}}，{{ t('t15_6') }}：×{{index<36?format(Decimal.pow(2,tr.level)):format(tr.level.mul(0.2).add(1))}}<br />
                <button @click="buyTrait(index)" :disabled="totalHoney.lte(0)">{{ t('t15_7') }}{{format(tr.cost)}}{{ t('t15_12') }}</button>
            </div>
            </template>
            <p>{{ t('t15_13') }}</p>
            <template v-for="(tr, index) in traits" :key="'c'+index">
            <div v-if="index>=39 & index<42" class="pei-life">
                {{ t('t15_14') }}{{index+1}}: {{ t('t15_15') }}{{index==39?"所有佩干生命产量×2":index==40?"所有佩干生命速度×2":"所有佩干生命价格÷2"}}<br />
                {{ t('t15_5') }}：{{tr.level}}，{{ t('t15_6') }}：×{{format(Decimal.pow(2,tr.level))}}<br />
                <button @click="buyTrait(index)" :disabled="totalCaramel.lte(0)">{{ t('t15_7') }}{{format(tr.cost)}}{{ t('t15_16') }}</button>
            </div>
            </template>
        </div>
    </div>

    <div v-if="currentTab === 16">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="this.sweetenCount.gte(1)">
            <h4>{{ t('t16_1') }} ({{ t('t16_2') }}{{ formatInt(this.sweetenCount) }}{{ t('t16_3') }})</h4>
            <div v-for="i in 12" class="upgrade-item" :class="{ 'unlocked': sweetenCount.gte(i<=8?i:i*4-24) }">
                {{ t('t16_4') }}{{i<=8?i:i*4-24}}{{ t('t16_3') }}<br />
                {{t('sweet_'+(i-1))}}
            </div>
        </div>
        <div v-else>
            <p>{{ t('t16_5') }}</p>
        </div>
    </div>

    <div v-if="currentTab === 17">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="this.totalCaramel.gte(1)">
            <h4>{{ t('t17_1') }}</h4> 
            <div v-if="refineryU[0].level.gte(1)">
                {{ t('t17_2') }}{{format(sugarCharge)}}{{ t('t17_3') }}(+{{format(SCproduction)}}/s){{ t('t17_4') }}{{format(sugarCharge.add(1))}}<br /><br />
            </div>
            <div v-for="upgrade in refineryU" :key="upgrade.id" class="upgrade-item">
                {{t('re_'+(upgrade.id-1))}}<br />
                {{ t('t17_5') }} {{ formatInt(upgrade.level) }}/{{ upgrade.maxLevel }}
                <button @click="buyRefineryU(upgrade.id-1)"
                        :disabled="caramel.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)">
                    {{ format(upgrade.cost) }} {{ t('t17_6') }}
                </button>
                <button @click="buyMaxRefineryU(upgrade.id-1)">
                    {{ t('t17_7') }}
                </button>
            </div>
        </div>
        <div v-else>
            <p>{{ t('t17_8') }}</p>
        </div>
    </div>

    <div v-if="currentTab === 18" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        {{ t('t18_1') }}<br />
        {{ t('t18_2') }}
        {{ t('t18_3') }}<br />
        {{ t('t18_4') }}
        <div class="space-reset-section">
            <h4>{{ t('t18_5') }}</h4>
            <p v-if="!canSpaceReset" class="reset-locked">{{ t('t18_6') }} {{format(this.totalLifetimePei)}}/1e20,000 {{ t('t18_7') }}<br /> {{format(this.totalFosskie)}}/1e60 {{ t('t18_8') }}</p>
            <div v-else class="reset-ready">
                <p>{{ t('t18_9') }}: {{ format(nutGain) }}</p>
                <button @click="spaceReset" class="space-reset-button">{{ t('t18_10') }}</button>
            </div>
        </div>
        <div v-for="m in SPACE_MILESTONES" :key="m.text1" class="upgrade-item" :class="{ 'unlocked': spaceMilestoneUnlocked(m) }">
                {{ t(m.text1) }}<br />
                {{ t(m.text2) }}<template v-if="m.extra === 'hyperArtifact12'">(×{{format(N(this.totalLifetimePei.add(10).log(10)).pow(1/6))}})</template><template v-if="m.extra === 'nuts'">(×{{format(this.nutCount.div(1e12).add(1).pow(2))}})</template>
        </div>
    </div>

    <div v-if="currentTab === 19" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <div class="space-upgrades-tree">
            <h3>{{ t('t19_1') }} ({{ format(nutCount) }} {{ t('t19_2') }})</h3>
            <div class="upgrade-node">
                <div class="upgrade-info">
                    <div>{{ t('t19_3') }}1 {{ t('t19_4') }}{{ spaceU[0].level }}/10</div>
                    <div>{{ t('t19_5') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[0].level))}})</div>
                    <button @click="buySpaceU(1)">{{ format(getSpaceUC(1)) }}{{ t('t19_2') }}</button>
                </div>
                <div class="upgrade-info">
                    <div>{{ t('t19_3') }}2 {{ t('t19_4') }}{{ spaceU[1].level }}/10</div>
                    <div>{{ t('t19_7') }}({{ t('t19_6') }}{{format(Decimal.pow(65536,spaceU[1].level))}})</div>
                    <button @click="buySpaceU(2)">{{ format(getSpaceUC(2)) }}{{ t('t19_2') }}</button>
                </div>
                <div class="children-container">
                    <div class="upgrade-node" :class="{unlocked: spaceU[0].level.gte(1) || spaceU[1].level.gte(1)}">
                        <div class="upgrade-info">
                            <div>{{ t('t19_3') }}3 {{ t('t19_4') }}{{ spaceU[2].level }}/10</div>
                            <div>{{ t('t19_8') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[2].level))}})</div>
                            <button @click="buySpaceU(3)" :disabled="spaceU[0].level.lt(1)">{{ format(getSpaceUC(3)) }}{{ t('t19_2') }}</button>
                        </div>
                        <div class="upgrade-info">
                            <div>{{ t('t19_3') }}4 {{ t('t19_4') }}{{ spaceU[3].level }}/10</div>
                            <div>{{ t('t19_9') }}({{ t('t19_6') }}{{format(Decimal.pow(256,spaceU[3].level))}})</div>
                            <button @click="buySpaceU(4)" :disabled="spaceU[1].level.lt(1)">{{ format(getSpaceUC(4)) }}{{ t('t19_2') }}</button>
                        </div>
                        <div class="children-container">
                            <div class="upgrade-node" :class="{unlocked: spaceU[2].level.gte(1) || spaceU[3].level.gte(1)}">
                                <div class="upgrade-info">
                                <div>{{ t('t19_3') }}5 {{ t('t19_4') }}{{ spaceU[4].level }}/10</div>
                                <div>{{ t('t19_10') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[4].level))}})</div>
                                <button @click="buySpaceU(5)" :disabled="spaceU[2].level.lt(1)">{{ format(getSpaceUC(5)) }}{{ t('t19_2') }}</button>
                                </div>
                                <div class="upgrade-info">
                                <div>{{ t('t19_3') }}6 {{ t('t19_4') }}{{ spaceU[5].level }}/10</div>
                                <div>{{ t('t19_11') }}({{ t('t19_6') }}{{format(Decimal.pow(16,spaceU[5].level))}})</div>
                                <button @click="buySpaceU(6)" :disabled="spaceU[3].level.lt(1)">{{ format(getSpaceUC(6)) }}{{ t('t19_2') }}</button>
                                </div>
                                <div class="children-container">
                                    <div class="upgrade-node" :class="{unlocked: spaceU[4].level.gte(1) || spaceU[5].level.gte(1)}">
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}7 {{ t('t19_4') }}{{ spaceU[6].level }}/10</div>
                                        <div>{{ t('t19_12') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[6].level))}})</div>
                                        <button @click="buySpaceU(7)" :disabled="spaceU[4].level.lt(1)">{{ format(getSpaceUC(7)) }}{{ t('t19_2') }}</button>
                                        </div>
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}8 {{ t('t19_4') }}{{ spaceU[7].level }}/10</div>
                                        <div>{{ t('t19_13') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[7].level))}})</div>
                                        <button @click="buySpaceU(8)" :disabled="spaceU[5].level.lt(1)">{{ format(getSpaceUC(8)) }}{{ t('t19_2') }}</button>
                                        </div>
                                    <div class="children-container">
                                        <div class="upgrade-node" :class="{unlocked: spaceU[4].level.gte(1) || spaceU[5].level.gte(1)}">
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}9 {{ t('t19_4') }}{{ spaceU[8].level }}/10</div>
                                        <div>{{ t('t19_14') }}({{ t('t19_6') }}{{format(Decimal.pow(2,spaceU[8].level))}})</div>
                                        <button @click="buySpaceU(9)" :disabled="spaceU[6].level.lt(1)">{{ format(getSpaceUC(9)) }}{{ t('t19_2') }}</button>
                                        </div>
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}10 {{ t('t19_4') }}{{ spaceU[9].level }}/10</div>
                                        <div>{{ t('t19_15') }}({{ t('t19_6') }}{{format(Decimal.pow(4,spaceU[9].level))}})</div>
                                        <button @click="buySpaceU(10)" :disabled="spaceU[7].level.lt(1)">{{ format(getSpaceUC(10)) }}{{ t('t19_2') }}</button>
                                        </div>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                                        <div class="upgrade-node">
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}11 {{ t('t19_4') }}{{ spaceU[10].level }}/10</div>
                                        <div>{{ t('t19_16') }}({{ t('t19_6') }}{{format(spaceU[10].level.mul(0.1).add(1))}})</div>
                                        <button @click="buySpaceU(11)">{{ format(getSpaceUC(11)) }}{{ t('t19_2') }}</button>
                                        </div>
                                        <div class="upgrade-info">
                                        <div>{{ t('t19_3') }}12 {{ t('t19_4') }}{{ spaceU[11].level }}/10</div>
                                        <div>{{ t('t19_17') }}({{ t('t19_6') }}{{format(spaceU[11].level.mul(0.1).add(1))}})</div>
                                        <button @click="buySpaceU(12)">{{ format(getSpaceUC(12)) }}{{ t('t19_2') }}</button>
                                        </div>
                                        </div>
            
        </div>
    </div>

    <div v-if="currentTab === 20" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        {{ t('tc_0') }}{{format(salt)}}{{ t('t20_1') }}（{{ t('t20_2') }}{{format(N(playTime2))}}/{{format(N(saltTimeCap))}}）<br />
        {{ t('t20_3') }}{{format(salt.div(1000).add(1))}}<br />
        （{{ t('t20_4') }}{{format(sugar)}}{{ t('t20_5') }}）<br />
        <h4>{{ t('t20_6') }}</h4>
        <div v-for="upgrade in saltU" :key="upgrade.id" class="upgrade-item">
            <div>{{ t('t20_7') }}{{ upgrade.id }} {{ t('t19_4') }}{{ upgrade.level }}/9</div>
            <div>{{ upgrade.id==1?t('t20_8'):upgrade.id==2?t('t20_9'):upgrade.id==3?t('t20_10'):upgrade.id==4?t('t20_11'):''}}({{ t('t20_12') }}{{ format(upgrade.level.add(1)) }})</div>
            <button @click="buySaltU(upgrade.id)">{{ t('t20_13') }}{{ format(upgrade.basecost) }}{{ t('t20_1') }}</button>
        </div>
    </div>

    <div v-if="currentTab === 21" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <h4>{{ t('t21_0') }}</h4>
        <div>{{ t('t21_1') }}</div><br />
        <div class="achievement-grid">
            <div v-for="achievement in advancedAchievements" :key="achievement.id">
                <div class="upgrade-item" v-if="achievement.id==1 || achievement.id==2 || (achievement.id==3 && refineryU[2].level.gte(1)) || (achievement.id==4 && condenseryU[2].level.gte(1))">
                    <div>{{ achievement.description }}</div><br />
                    <div>{{ t('t21_2') }}: {{ formatInt(achievement.completedTimes) }}</div><br />
                    <div>{{ t('t21_3') }}: {{ format(advancedAchievementsTarget(achievement.id))}}</div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="currentTab === 22" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <div v-if="nobreakRecord.gte('1e300000') || cinnamonResetCount.gte(1) || vanillaResetCount.gte(1)">
            <div>{{ t('t22_1') }}</div>
            <div>{{ t('tc_0') }} {{format(cinnamon)}} {{ t('t22_2') }}，{{format(vanilla)}} {{ t('t22_3') }}</div>
            <div>{{ t('t22_4') }}{{format(calculateSpiceBonus())}}</div>
            <div class="space-reset-section">
                <h4>{{ t('t22_5') }}</h4>
                <p v-if="!canSpiceReset" class="reset-locked">{{ t('t18_6') }} {{format(this.totalLifetimePei)}}/1e1,250,000 {{ t('t18_7') }}<br /> {{format(this.totalStarkie)}}/1e80 {{ t('tc_3') }}</p>
                <div v-else class="reset-ready">
                    <p>{{ t('t22_6') }}: {{ format(cinnamonGain) }}</p>
                    <p>{{ t('t22_7') }}</p>
                    <button @click="cinnamonReset" class="space-reset-button">{{ t('t22_5') }}</button>
                </div>
            </div>
            <div class="space-reset-section">
                <h4>{{ t('t22_8') }}</h4>
                <p v-if="!canSpiceReset" class="reset-locked">{{ t('t18_6') }} {{format(this.totalLifetimePei)}}/1e1,250,000 {{ t('t18_7') }}<br /> {{format(this.totalStarkie)}}/1e80 {{ t('tc_3') }}</p>
                <div v-else class="reset-ready">
                    <p>{{ t('t22_9') }}: {{ format(vanillaGain) }}</p>
                    <p>{{ t('t22_10') }}</p>
                    <button @click="vanillaReset" class="space-reset-button">{{ t('t22_8') }}</button>
                </div>
            </div>
            <div class="shop">
                <h4>{{ t('t22_11') }}</h4>
                <div>{{ t('t22_12') }}</div>
            </div>
            <div v-for="m in SPICE_MILESTONES" :key="m.text1" class="upgrade-item" :class="{ 'unlocked': spiceMilestoneUnlocked(m) }">
                {{ t(m.text1) }}<br />
                {{ t(m.text2) }}
            </div>
        </div>
        <div v-else>{{ t('t22_21') }}</div>
    </div>

    <div v-if="currentTab === 23" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <template v-if="cinnamonResetCount < 1">
            <div style="font-size: 16px; font-weight: bold; color: #ff0000;">{{ t('t23_1') }}</div>
        </template>
        <template v-else>
            <h3>{{ t('t23_2') }}</h3>
        <div>{{ t('t23_3') }}: {{formatInt(antHillLevel)}}</div>
        <div>{{ t('t23_4') }}: {{format(antReleaseSpeed)}}</div>
        <div>{{ t('t23_5') }}: {{format(antsNotDriven)}}</div>
        <div>{{ t('t23_6') }}: {{format(antsDriven)}}</div>
        <div>{{ t('t23_7') }}: {{format(calculateCinnamonEffect())}}</div>
        <div>{{ t('t23_8') }}: ×{{format(calculateAntBonus())}}</div>
        <div class="shop">
            <h4>{{ t('t23_9') }}</h4>
            <div>{{ t('t23_10') }}</div>
            <div>{{ t('t23_11') }}</div>
            <div>{{ t('t23_12') }}</div>
            <div>{{ t('t23_13') }}</div>
            <div>{{ t('t23_14') }}</div>
        </div>
        <div class="upgrade-item">
            <h4>{{ t('t23_15') }}</h4>
            <div>{{ t('t23_16') }}: {{formatInt(antHillLevel)}}</div>
            <div>{{ t('t23_17') }}: {{format(Decimal.pow(2, antHillLevel.add(1)).sub(1))}}</div>
            <button @click="updateAntHillLevel(antHillLevel.add(1))">{{ t('t23_18') }}</button>
            <button @click="updateAntHillLevel(antHillLevel.sub(1))">{{ t('t23_19') }}</button>
        </div>
        </template>
    </div>

    <div v-if="currentTab === 24" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <template v-if="vanillaResetCount < 1">
            <div style="font-size: 16px; font-weight: bold; color: #ff0000;">{{ t('t24_1') }}</div>
        </template>
        <template v-else>
            <h3>{{ t('t24_0') }}</h3>
        <div>{{ t('tc_0') }} {{format(totalChallengeCompletions)}} {{ t('t24_2') }}</div>
        <div>{{ t('t24_3') }}：{{format(vanilla)}}</div>
        <div>{{ t('t24_4') }}：×{{format(calculateChallengeBonus())}}</div>
        <div class="achievement-grid">
            <div v-for="challenge in challenges" :key="challenge.id">
                <div class="upgrade-item">
                    <p>{{ challenge.name }} : {{ challenge.description }}</p>
                    <p>{{ t('t24_2') }}: {{formatInt(challenge.completedTimes)}}</p>
                    <p>{{ t('t24_13') }}：{{ format(Decimal.pow(10, challenge.completedTimes.add(1).mul(100000))) }}</p>
                    <p v-if="challenge.active">{{ t('t24_5') }}</p>
                    <div v-if="canCompleteChallenge(challenge.id) && challenge.active">
                        <button @click="completeChallenge(challenge.id)">{{ t('t24_6') }}</button>
                    </div>
                    <div class="bulk-selector">
                        <button @click="startChallenge(challenge.id)" :disabled="isChallengeActive()">
                            {{ t('t24_7') }}
                        </button>
                        <button @click="endChallenge(challenge.id)" :disabled="!challenge.active">
                            {{ t('t24_8') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="shop">
            <h4>{{ t('t24_9') }}</h4>
            <div>{{ t('t24_10') }}</div>
            <div>{{ t('t24_11') }}</div>
            <div>{{ t('t24_12') }}</div>
        </div>
        </template>
    </div>

    <div v-if="currentTab === 25" class="space">
        <div class="divider" style="color:#000080">----------------------------------------------------------------</div>
        <template v-if="condenseryU[4].level.gte(1)">
            <h3>{{ t('t25_1') }}</h3>
            <div>{{ t('t25_2') }}：{{format(magicPoints)}}</div>
            <div>{{ t('t25_3') }}：{{format(magicAmount)}}/{{format(magicCap)}}</div>
            <div>{{ t('t25_5') }}：{{format(calcMagicProduction())}}/{{ t('t25_10') }}</div>
            <h4>{{ t('t25_6') }}</h4>
            <div v-for="i in 4" :key="'mu'+i" class="upgrade-item">
                <div>{{ t('t25_'+(14+i)) }}</div>
                <div>{{ t('t32_2') }}：{{formatInt(magicUpgrades[i-1])}}</div>
                <button @click="upgradeMagic(i)">{{ t('t25_23') }}{{i}}，{{ t('t25_24') }}</button>
            </div>
            <h4>{{ t('t25_7') }}</h4>
            <div v-for="skill in magicSkills" :key="skill.id" class="upgrade-item" :class="{ 'unlocked': skill.active }">
                <div>{{ t('t25_'+(18+skill.id)) }}</div>
                <div>{{ t('t25_11') }} {{skill.cost}} {{ t('t25_12') }}，{{ t('t25_9') }} {{calcMagicSkillDuration(skill.id).toFixed(0)}}{{ t('t25_10') }}</div>
                <div v-if="skill.active">{{ t('t25_25') }}（{{skill.timer.toFixed(1)}}{{ t('t25_10') }}）</div>
                <button v-else @click="activateMagicSkill(skill.id)" :disabled="magicAmount.lt(skill.cost)">{{ t('t25_8') }}</button>
            </div>
        </template>
        <div v-else>{{ t('t25_14') }}</div>
    </div>

    <div v-if="currentTab === 26">
        <div class="divider">----------------------------------------------------------------</div>
        <div>
            {{ t('t26_1') }}<br />
            {{ t('t26_2') }}
            {{ t('t26_3') }}
            {{ t('t26_4') }}<br />
            {{ t('t26_5') }},
            {{ t('t26_5b') }}<br />
            <br />
            {{ t('t26_6') }}<br />
            {{ t('t26_7') }}<br />
            {{ t('t26_8') }}<br />
            {{ t('t26_9') }}<br />
            <br />
            <div>{{ t('t26_10') }}: {{milkLevel}}</div>
            <div>{{ t('t26_11') }}: {{format(milkExp)}}/{{format(milkExpReq)}}</div>
            <div>{{ t('t26_12') }}：{{milkLevel>=60?t('t26_13')+(milkLevel.toNumber()-60):t('milk_'+milkLevel.toNumber())}}</div>
            <div>{{ t('t26_14') }}{{format(milkLevel.mul(0.01).add(1))}}({{ t('t26_15') }}{{format(Decimal.pow(milkLevel.mul(0.01).add(1),milk))}})</div>
            <div>{{ t('t26_16') }}{{format(milkLevel.mul(0.002).add(1))}}({{ t('t26_15') }}{{format(Decimal.pow(milkLevel.mul(0.002).add(1),milk))}})</div>
            <br />
            {{ t('t26_17') }}：{{format(starkie)}}<br />
            {{ t('t26_18') }}：{{format(totalStarkie)}}<br />
            {{ t('t26_19') }}：{{format(resetStarkie)}}<br />
            {{ t('t26_20') }}：{{format(cheese)}}<br />
            {{ t('t26_21') }}：{{format(totalCheese)}}<br />
            {{ t('t26_22') }}：{{format(cream)}}<br />
            {{ t('t26_23') }}：{{format(totalCream)}}<br />
            {{ t('t26_24') }}：{{format(butter)}}<br />
            {{ t('t26_25') }}：{{format(totalButter)}}<br />
        </div>
    </div>

    <div v-if="currentTab === 27">
        <div class="divider">----------------------------------------------------------------</div>
        <div>{{ t('t27_1') }}</div>
        <div>{{ t('t27_2') }}</div>
        <div>{{ t('t27_3') }}：{{format(totalStarkie)}}</div>
        <div>{{ t('t27_4') }}{{format(this.totalStarkie.add(1).pow(0.25))}}</div>
        <div class="bulk-selector">
            {{ t('t27_5') }}: 
            <select v-model="bulkCeleAmount">
                <option value="1">×1</option>
                <option value="10">×10</option>
                <option value="100">×100</option>
                <option value="1000">×1000</option>
            </select>
        </div>
        <div v-for="(p, index) in peiCeles" :key="index" class="pei-cele">
            {{ t('t27_6') }}{{ p.id }} - {{p.id<=32?t('t27_7'):t('t27_8')}}，{{t('type_'+celetype[p.id-1])}} - {{p.progress.toFixed(1)}}/{{p.duration.toFixed(1)}}s<br />
            {{ t('t27_9') }}：{{p.level}} {{ t('t27_10') }}：{{format(p.baseProd)}} {{ t('t27_11') }}：{{format(calcCeleProd(index))}}<br />
            {{ t('t27_11') }}×{{format(calcCeleMult(index))}} {{ t('t27_12') }}×{{format(calcCeleSpeedMult(index))}} {{ t('t27_13') }}÷{{format(calcCeleCostMult(index))}}<br />
        <button @click="buyPeiCele(index, bulkCeleAmount)" :disabled="starkie.lt(calcCeleBulkCost(index, bulkCeleAmount))">
            {{ t('t27_14') }}×{{bulkCeleAmount}} {{ t('t27_15') }} {{ format(calcCeleBulkCost(index, bulkCeleAmount)) }}
        </button>
        <div class="progress-bar">
            <div :style="{ width: p.progress/p.duration*100 + '%' }"></div>
        </div>
        </div>
    </div>

    <div v-if="currentTab === 28">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="resetStarkie.gte(1e12)">
            <p>{{ t('t28_1') }}<br />{{ t('t28_2') }} {{format(cheeseGain)}} {{ t('t28_3') }}</p>
            <button @click="cheeseReset" style="padding:5px 20px">{{ t('t28_4') }}</button>
        </div>
        <div v-else>
            {{ t('t28_5') }}<br />
            {{format(resetStarkie)}}/1e12
        </div>
        <div v-if="resetStarkie.gte(1e48)" class="shop">
            <p>{{ t('t28_6') }}<br />{{ t('t28_2') }} {{format(creamGain)}} {{ t('t28_7') }}</p>
            <button @click="creamReset" style="padding:5px 20px">{{ t('t28_8') }}</button>
        </div>
        <div v-else class="shop">
            {{ t('t28_9') }}<br />
            {{format(resetStarkie)}}/1e48
        </div>
        <div v-if="cinnamonResetCount.gte(1) || vanillaResetCount.gte(1)">
            <div v-if="resetStarkie.gte(nextDream)" class="shop">
                <p>{{ t('t28_10') }}<br />{{ t('t28_11') }}</p>
                <button @click="dreamReset" style="padding:5px 20px">{{ t('t28_12') }}</button>
            </div>
            <div v-else class="shop">
                {{ t('t28_13') }}{{format(nextDream)}}{{ t('t28_13b') }}<br />
                {{format(resetStarkie)}}/{{format(nextDream)}}
            </div>
            <div v-if="resetStarkie.gte(1e308) & dreamCount.gte(8)" class="shop">
                <p>{{ t('t28_14') }}<br />{{ t('t28_2') }} {{format(butterGain)}} {{ t('t28_15') }}</p>
                <button @click="butterReset" style="padding:5px 20px">{{ t('t28_16') }}</button>
            </div>
            <div v-else class="shop">
                {{ t('t28_17') }}<br />
                {{formatInt(dreamCount)}}/8 {{format(resetStarkie)}}/1e308
            </div>
        </div>
    </div>
    
    <div v-if="currentTab === 29">
        <div class="divider">----------------------------------------------------------------</div>
        <div>
            {{ t('t29_1') }}：{{format(cheese)}}<br />
            {{ t('t29_2') }}：{{format(cream)}}<br />
            {{ t('t29_3') }}：{{format(butter)}}<br />
            <p>{{ t('t29_4') }}  {{ t('t29_5') }}</p>
            <template v-for="(e, index) in enhans" :key="'a'+index">
            <div v-if="index<14" class="pei-cele">
                {{ t('t29_4') }}{{index+1}}: {{ t('t29_6') }}14n+{{index+1}}{{ t('t29_7') }}<br />
                {{ t('t29_8') }}：{{e.level}}，{{ t('t29_9') }}：×{{format(Decimal.pow(2,e.level))}}<br />
                <button @click="buyEnhan(index)" :disabled="totalCheese.lte(0)">{{ t('t29_10') }}{{format(e.cost)}}{{ t('t28_3') }}</button>
            </div>
            </template>
            <p>{{ t('t29_11') }}  {{ t('t29_12') }}</p>
            <template v-for="(e, index) in enhans" :key="'b'+index">
            <div v-if="index>=15 & index<29" class="pei-cele">
                {{ t('t29_11') }}{{index-14}}: {{ t('t29_6') }}{{t('type_'+(index-15))}}{{ t('t29_13') }}<br />
                {{ t('t29_8') }}：{{e.level}}，{{ t('t29_9') }}：×{{format(Decimal.pow(2,e.level))}}<br />
                <button @click="buyEnhan(index)" :disabled="totalCream.lte(0)">{{ t('t29_10') }}{{format(e.cost)}}{{ t('t28_7') }}</button>
            </div>
            </template>
            <p>{{ t('t29_14') }}  {{ t('t29_15') }}</p>
            <template v-for="(e, index) in enhans" :key="'c'+index">
            <div v-if="index>=30 & index<33" class="pei-cele">
                {{ t('t29_14') }}{{index+1}}: {{index==30?t('t29_16'):index==31?t('t29_17'):index==32?t('t29_18'):''}}<br />
                {{ t('t29_8') }}：{{e.level}}，{{ t('t29_9') }}：{{format(Decimal.pow(2,e.level))}}<br />
                <button @click="buyEnhan(index)" :disabled="totalButter.lte(0)">{{ t('t29_10') }}{{format(e.cost)}}{{ t('t28_15') }}</button>
            </div>
            </template>
        </div>
    </div>

    <div v-if="currentTab === 30">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="this.dreamCount.gte(1)">
            <h4>{{ t('t30_1') }} ({{ t('t30_2') }}{{ formatInt(this.dreamCount) }}{{ t('t30_3') }})</h4>
            <div v-for="i in 8" class="upgrade-item" :class="{ 'unlocked': dreamCount.gte(i<=8?i:i*4-24) }">
                {{ t('t30_4') }}{{i<=8?i:i*4-24}}{{ t('t30_3') }}<br />
                {{t('dream_'+(i-1))}}
            </div>
        </div>
        <div v-else>
            <p>{{ t('t30_5') }}</p>
        </div>
    </div>

    <div v-if="currentTab === 31">
        <div class="divider">----------------------------------------------------------------</div>
        <div v-if="dreamCount.gte(1)">
            <div>{{ t('t31_1') }}：×{{format(calcResearchSpeedMult())}}</div>
            <template v-for="(r, index) in astroResearch" :key="index">
            <div v-if="index < 14" class="pei-cele">
            {{ t('t31_2') }}{{ r.id }} - {{ t('t29_8') }}：{{r.level}} - {{format(N(r.progress))}}/{{format(N(calcResearchDuration(index)))}}s<br />
            <div v-if="index < 14">
                {{ t('t31_3') }}{{index*4+1}}{{ t('t31_4') }}{{index*4+4}}{{ t('t31_5') }}（{{ t('t31_6') }}{{format(Decimal.pow(2, r.level))}}）
            </div>
            <div v-else>
                {{ t('t31_7') }}
            </div>
            <button @click="startAstroResearch(index)" :disabled="r.active" style="padding:5px 20px">
                {{r.active ? t('t31_8') : t('t31_9')}}
            </button>
            <button @click="cancelAstroResearch(index)" :disabled="!r.active" style="padding:5px 20px">
                {{ t('t31_10') }}
            </button>
            <div class="progress-bar2">
                <div :style="{ width: r.progress/calcResearchDuration(index)*100 + '%' }"></div>
            </div>
            </div>
            </template>
        </div>
        <div v-else>{{ t('t31_11') }}</div>
    </div>
    <div v-if="currentTab === 32">
        <div class="divider">----------------------------------------------------------------</div>
        <template v-if="totalButter.gte(1)">
            <h3>{{ t('t32_1') }}</h3>
            <div>{{ t('t32_3') }}：{{format(milkCharge)}}</div>
            <div v-for="upgrade in condenseryU" :key="upgrade.id" class="upgrade-item">
                <div>{{ t('ce_'+(upgrade.id-1)) }}</div>
                <div>{{ t('t32_2') }}：{{upgrade.level}}/{{format(upgrade.maxLevel)}}</div>
                <div>{{ t('t32_3') }}×{{format(calcCondenseryMult(upgrade.id))}}</div>
                <button @click="buyCondenseryU(upgrade.id)" :disabled="caramel.lt(upgrade.cost)">{{ t('t32_4') }} {{format(upgrade.cost)}}</button>
            </div>
        </template>
        <div v-else>{{ t('t32_7') }}</div>
    </div>
    <div v-if="currentTab === 33">
        <div class="divider">----------------------------------------------------------------</div>
        <template v-if="condenseryU[2].level.gte(1)">
            <h3>{{ t('t33_1') }}</h3>
            <div>{{ t('t33_1') }}：{{format(constellationFragments)}} / {{format(totalConstellationFragments)}}</div>
            <div>
                <button @click="gainConstellationFragment" :disabled="!canGainConstellationFragment">
                    {{ t('t33_2') }}（{{ t('t33_3') }} {{format(constellationFragmentCost())}} {{ t('t33_4') }}）
                </button>
            </div>
            <h4>{{ t('t33_5') }}</h4>
            <div v-for="c in constellationUpgrades" :key="c.id" class="upgrade-item" :class="{ 'unlocked': c.active }">
                <div>{{ t('constell_'+(c.id-1)) }} - {{ t('constellD_'+(c.id-1)) }}</div>
                <div>{{ c.active ? t('t33_6') : t('t33_7') }} | {{ t('t33_8') }} {{c.cost}} {{ t('t33_9') }}</div>
                <button v-if="!c.active" @click="activateConstellation(c.id)" :disabled="constellationFragments.lt(c.cost)">{{ t('t33_10') }}</button>
                <button v-else @click="deactivateConstellation(c.id)">{{ t('t33_11') }}</button>
            </div>
            <button @click="deactivateAllConstellations">{{ t('t33_12') }}</button>
        </template>
        <div v-else>{{ t('t33_13') }}</div>
    </div>
    <div v-if="currentTab === 34">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t34_1') }}</h3>
        <div>{{ t('t34_2') }}</div>
        <div>{{ t('t34_12') }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <div>{{ t('t34_3') }}: {{ format(datakie) }}</div>
        <div>{{ t('t34_4') }}: {{ format(eggs) }}</div>
        <div>{{ t('t34_5') }}: {{ format(chickens) }}</div>
        <div>{{ t('t34_6') }}: {{ format(flour) }}</div>
        <div>{{ t('t34_7') }}: {{ format(matcha) }}</div>
        <div>{{ t('t34_8') }}: {{ format(coffee) }}</div>
        <div>{{ t('t34_9') }}: {{ format(gelatin) }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <div>{{ t('t34_10') }}: {{ format(dataKiePerSecond) }} {{ t('t34_11') }}</div>
    </div>
    <div v-if="currentTab === 35">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t35_0') }}</h3>
        <div class="bulk-selector">
            {{ t('t35_1') }}
            <select v-model="exploreBulkAmount">
                <option value="1">1</option>
                <option value="10">10</option>
                <option value="100">100</option>
                <option value="1000">1000</option>
            </select>
        </div>
        <div class="divider">----------------------------------------------------------------</div>
        <div v-for="(area, index) in exploreArea" :key="index" class="building">
            &nbsp;&nbsp;{{ t('t35_2') }}{{ index + 1 }}: {{ t('expArea_'+index) }}&nbsp;&nbsp;<br />
            &nbsp;&nbsp;{{ t('t35_3') }}: {{ formatInt(area.quantity) }}&nbsp;&nbsp;<br />
            &nbsp;&nbsp;{{ t('t35_4') }}: {{ format(area.baseProd) }}&nbsp;&nbsp;<br />
            &nbsp;&nbsp;{{ t('t35_5') }}: {{ format(area.production) }}&nbsp;&nbsp;
            <button @click="buyExploreArea(index)"
                    :disabled="datakie.lt(calcExploreBulkCost(index))">
                {{ t('t35_6') }}{{ exploreBulkAmount }}<br />
                {{ t('t35_8') }} {{ format(calcExploreBulkCost(index)) }} {{ t('t35_7') }}
            </button>
        </div>
    </div>
    <div v-if="currentTab === 36">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t36_0') }}</h3>
        <div>{{ t('t36_2') }}{{ format(flourMult) }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t36_3') }}</h4>
        <div v-for="n in 10" :key="'ba'+n">
            <div v-for="a in 14" :key="'ba'+n+'_'+a" class="upgrade-item" :class="{ 'unlocked': exploreAchievements[(n-1)*14+(a-1)].unlocked }">
                {{ t('expArea_'+(a-1)) }} {{ n*100 }} - {{ exploreAchievements[(n-1)*14+(a-1)].unlocked ? 'OK' : t('t36_1')+': '+formatInt(exploreArea[a-1].quantity)+'/'+(n*100) }}
            </div>
        </div>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t36_4') }}</h4>
        <div v-for="i in 10" :key="'da'+i" class="upgrade-item" :class="{ 'unlocked': exploreAchievements[140+(i-1)].unlocked }">
            {{ t('t36_4') }} {{ i }} - {{ exploreAchievements[140+(i-1)].unlocked ? 'OK' : format(datakie)+'/'+format(N(10).pow(i*10+12)) }}
        </div>
    </div>
    <div v-if="currentTab === 37">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t37_0') }}</h3>
        <div>{{ t('t37_1') }}: {{ format(eggs) }}</div>
        <div>{{ t('t37_2') }}: {{ format(chickens) }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <div v-for="auto in advancedAutomation" :key="auto.id" class="upgrade-item">
            <div>{{ t('advAuto_'+(auto.id-1)) }}</div>
            <div v-if="!auto.unlocked">
                <button @click="unlockAdvAuto(auto.id)" :disabled="chickens.lt(auto.cost)">{{ t('t37_4') }} - {{ t('t37_5') }}: {{ format(auto.cost) }} {{ t('t37_2') }}</button>
            </div>
            <div v-else>
                <button @click="toggleAdvAuto(auto.id)" :class="{ 'active-tab': auto.activate }">
                    {{ auto.activate ? 'ON' : 'OFF' }}
                </button>
            </div>
        </div>
    </div>
    <div v-if="currentTab === 38">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t38_0') }}</h3>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t38_1') }}</h4>
        <div>{{ t('t38_2') }}</div>
        <div>{{ t('t38_4') }}: {{ format(matchaGain) }} {{ t('t38_3') }}</div>
        <button @click="matchaReset" :disabled="datakie.lt(1e12)" style="padding:5px 20px">{{ t('t38_5') }}</button>
        <div v-if="datakie.lt(1e12)">{{ t('t38_6') }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t38_7') }}</h4>
        <div>{{ t('t38_8') }}</div>
        <div>{{ t('t38_4') }}: {{ format(coffeeGain) }} {{ t('t38_3') }}</div>
        <button @click="coffeeReset" :disabled="datakie.lt(1e48)" style="padding:5px 20px">{{ t('t38_9') }}</button>
        <div v-if="datakie.lt(1e48)">{{ t('t38_10') }}</div>
    </div>
    <div v-if="currentTab === 39">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t39_0') }}</h3>
        <div class="divider">----------------------------------------------------------------</div>
        <div v-for="upg in exploreUpgrades" :key="upg.id" class="upgrade-item">
            <div>{{ t('t39_1') }} {{ upg.id }}: {{ t('t39_5') }} {{ upg.id }} {{ t('t39_6') }}</div>
            <div>{{ t('t39_2') }}: {{ formatInt(upg.level) }}/{{ formatInt(upg.maxLevel) }}</div>
            <div>{{ t('t39_10') }}{{ format(Decimal.pow(2, upg.level)) }}</div>
            <button @click="buyExploreUpgrade(upg.id)" :disabled="datakie.lt(upg.cost) || upg.level.gte(upg.maxLevel)">
                {{ t('t39_4') }} - {{ format(upg.cost) }} {{ t('t34_3') }}
            </button>
        </div>
    </div>
    <div v-if="currentTab === 40">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t40_0') }}</h3>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t40_1') }}</h4>
        <div>{{ t('t40_2') }}</div>
        <div>{{ t('t40_3') }}</div>
        <div>{{ t('t40_4') }}: {{ format(gelatinGain) }} {{ t('t40_0') }}</div>
        <button @click="terminalReset" :disabled="datakie.lt(818268448)" style="padding:5px 20px">{{ t('t40_5') }}</button>
        <div v-if="datakie.lt(818268448)">{{ t('t40_6') }}</div>
        <div class="divider">----------------------------------------------------------------</div>
        <h4>{{ t('t40_7') }}</h4>
        <div v-for="upg in terminalUpgrades" :key="upg.id" class="upgrade-item">
            <div>{{ t('t40_7') }} {{ upg.id }}</div>
            <div>{{ t('t39_2') }}: {{ formatInt(upg.level) }}/{{ formatInt(upg.maxLevel) }}</div>
            <div v-if="upg.id===1">{{ t('t40_8') }}</div>
            <div v-else-if="upg.id===2">{{ t('t40_9') }}</div>
            <div v-else-if="upg.id===3">{{ t('t40_10') }}</div>
            <div v-else-if="upg.id===4">{{ t('t40_11') }}</div>
            <div v-else-if="upg.id===5">{{ t('t40_12') }}</div>
            <div>{{ t('t39_10') }}{{ format(Decimal.pow(1.1, upg.level)) }}</div>
            <button @click="buyTerminalUpgrade(upg.id)" :disabled="gelatin.lt(upg.cost) || upg.level.gte(upg.maxLevel)">
                {{ t('t39_4') }} - {{ format(upg.cost) }} {{ t('t34_9') }}
            </button>
        </div>
    </div>
    <div v-if="currentTab === 41">
        <div class="divider">----------------------------------------------------------------</div>
        <h3>{{ t('t41_0') }}</h3>
        <div>{{ t('t41_1') }}</div>
    </div>
</div>
</template>

<script>
import Decimal from 'break_infinity.js';
import pako from 'pako';
import { markRaw } from 'vue';
import { TEXTS } from './texts_extract.js';

var formatsave = {
    encoder: new TextEncoder(),
    decoder: new TextDecoder(),
    startString: 'PelkieClickerSaveFormat',
    endString: 'EndOfSaveFile',
    steps: [{
        encode: JSON.stringify,
        decode: JSON.parse
    },
    {
        encode: x => formatsave.encoder.encode(x),
        decode: x => formatsave.decoder.decode(x)
    },
    {
        encode: x => pako.deflate(x),
        decode: x => pako.inflate(x)
    },
    {
        encode: x => Array.from(x).map(i => String.fromCharCode(i)).join(""),
        decode: x => Uint8Array.from(Array.from(x).map(i => i.charCodeAt(0)))
    },
    {
        encode: x => btoa(x),
        decode: x => atob(x)
    },
    {
        encode: x => x.replace(/=+$/g, "").replace(/0/g, "0a").replace(/\+/g, "0b").replace(/\//g, "0c"),
        decode: x => x.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0")
    },
    {
        encode: x => formatsave.startString + x + formatsave.endString,
        decode: x => x.slice(formatsave.startString.length, -formatsave.endString.length),
    }
    ],
    encode(s) {
        return this.steps.reduce((x, f) => f.encode(x), s);
    },
    decode(s) {
        return this.steps.reduceRight((x, f) => f.decode(x), s);
    },
}

function transformToDecimal(object) {
    for (let i in object) {
        if (typeof (object[i]) == 'string' && !isNaN(N(object[i]).m)) object[i] = N(object[i]);
        if (typeof (object[i]) == 'object') transformToDecimal(object[i]);
    }
}

function data_print() {
    localStorage.PelkieClickerSave = formatsave.encode(JSON.stringify(data));
}

function data_input() {
    if (!localStorage.PelkieClickerSave) return;
    if (localStorage.PelkieClickerSave[0] == 'e') data = JSON.parse(atob(localStorage.PelkieClickerSave));
    else data = JSON.parse(formatsave.decode(localStorage.PelkieClickerSave));
    transformToDecimal(data);
}

async function jtb(text) {
    try {
        await navigator.clipboard.writeText(text);
        console.log('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
}

function export_save() {
    jtb(formatsave.encode(JSON.stringify(data)));
}

function import_save() {
    let userInput = prompt("导入：", "输入存档");
    if (userInput != null && userInput !== "") {
        if (userInput[0] == 'e') data = JSON.parse(atob(userInput));
        else data = JSON.parse(formatsave.decode(userInput));
        transformToDecimal(data);
        data_print();
        location.reload();
    } else {
    }
}

function N(num) {
    return markRaw(new Decimal(num));
}

const UPGRADES = (() => {
    const upgrades = [];
    upgrades.push({
        id: 0,
        buildingId: 1,
        required: N(0),
        cost: N(40),
    })
    //升级1~1050:建筑乘数升级
    for (let i = 1; i <= 1050; i++) {
        let index = (i-1) % 25 + 1;
        let bIndex = Math.floor((i-1) / 25);
        let costMult = [10,50,500,50000,5e6,5e9,5e12,5e15,5e18,5e21,5e24,5e27,5e30,5e33,5e36,5e39,5e42,5e48,5e54,5e60,5e120,'5e360','5e720','5e1200','5e1800'];
        let requirement = [1,5,25,50,100,150,200,250,300,350,400,450,500,550,600,650,700,800,900,1000,2000,6000,12000,20000,30000];
        upgrades.push({
            id: index,
            buildingId: bIndex+1,
            required: N(requirement[index-1]),
            cost: N(costMult[index-1]).mul(Math.pow(10, bIndex * (bIndex - 1) / 40 + bIndex + 1)),
        })
    }
    //升级1051~1070:点击乘数
    for (let i = 1; i <= 20; i++) {
        upgrades.push({
            id: i,
            buildingId: 101,
            required: N(100).pow(i),
            cost: N(100).pow(i).mul(5),
        })
    }
    //升级1071~1110:牛奶乘数
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 102,
            required: i==1?N(10):N(25).mul(i-1),
            cost: N(1000).pow(i).mul(9000),
        })
    }
    //升级1111~1150:建筑2协同
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 103,
            required: N(15),
            cost: N(Math.pow(10, i * (i - 1) / 40 + i + 1)).mul(150),
        })
    }
    //升级1151~1160:飞升效果
    for (let i = 1; i <= 10; i++) {
        let costs = [11, 1111, 111111, 11111111, 1111111111, 100, 1e12, 1e72, "1e432", "1e2592"];
        upgrades.push({
            id: i,
            buildingId: 104,
            required: i,
            cost: N(costs[i-1]),
        })
    }
    //升级1161~1250:飞升风味佩干
    for (let i = 1; i <= 90; i++) {
        let costs = [];
        upgrades.push({
            id: i,
            buildingId: 105,
            required: N(Math.floor((i-1)/10)+1),
            cost: i<=50?N(1e10).mul(N(10).pow(i/5)):N(100).pow(i),
        })
    }
    //升级1251~1290:建筑产量风味佩干
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 106,
            required: i<=16?i*50+50:i*1000-16000,
            cost: i<=16?N(1000).pow(i).mul(1e87):N(1e60).pow(i-16).mul(1e87),
        })
    }
    //升级1291~1299:金佩勒升级
    for (let i = 1; i <= 9; i++) {
        let requires = [7,27,77,0,9e15,9e15,9e15,9e15,9e15,]
        let costs = [777777777, 77777777777, 77777777777777, "1e6", "7e2777", "7e3777", "7e4777", "7e5777", "7e6777",];
        upgrades.push({
            id: i,
            buildingId: 107,
            required: N(requires[i-1]),
            cost: N(costs[i-1]),
        })
    }
    //升级1300~1339:飞升团结I升级,需要15个建筑
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 108,
            required: N(15),
            cost: N(Math.pow(10, (i + 1) * i / 40 + i + 2)).mul(150),
        })
    }
    //升级1340~1379:飞升团结II升级,需要75个建筑
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 109,
            required: N(75),
            cost: N(Math.pow(10, (i + 1) * i / 40 + i + 2)).mul(5e5),
        })
    }
    //升级1380~1419:释放糖块力量升级
    for (let i = 1; i <= 40; i++) {
        upgrades.push({
            id: i,
            buildingId: 110,
            required: N(Math.floor((i-1)/10)+1),
            cost: N(1e10).pow(i).mul(8e90),
        })
    }
    //其他升级……
    return upgrades;
})();
const ACHIEVEMENTS = (() => {
    const achievements = [];
    //成就 :累计获得的佩干数量
    for (let i = 1; i <= 25; i++) {
        let targetT = i <= 16 ? N(100).pow(i) : N(10).pow(N(2).pow(i - 15).mul(10));
        achievements.push({
            id: i,
            buildingId: 101,
            required: targetT,
        })
    }
    //成就 :每秒获得的佩干数量
    for (let i = 1; i <= 25; i++) {
        let targetS = i <= 16 ? N(10).pow(i) : N(10).pow(N(2).pow(i - 15).mul(10));
        achievements.push({
            id: i,
            buildingId: 102,
            required: targetS,
        })
    }
    //成就 :点击获得的佩干数量
    for (let i = 1; i <= 25; i++) {
        let targetC = i <= 16 ? N(100).pow(i) : N(10).pow(N(2).pow(i - 15).mul(10));
        achievements.push({
            id: i,
            buildingId: 103,
            required: targetC,
        })
    }
    //成就 :拥有的建筑数量
    for (let i = 1; i <= 1050; i++) {
        let target = [1,50,100,150,200,250,300,350,400,450,500,600,700,800,900,1000,2000,3000,4000,5000,6000,7000,8000,9000,10000];
        achievements.push({
            id: (i  -1) % 25 + 1,
            buildingId: Math.floor((i-1)/25) + 1,
            required: N(target[(i - 1) % 25]),
        })
    }
    //成就 :飞升层级成就
    for (let i = 1; i <= 25; i++) {
        let target = i <= 10 ? N(10).pow(i-1) : N(1e10).pow(i-10);
        achievements.push({
            id: i,
            buildingId: 104,
            required: target,
        })
    }
    //成就 :超越层级成就
    for (let i = 1; i <= 25; i++) {
        let target = i <= 10 ? N(10).pow(i-1) : N(1e10).pow(i-10);
        achievements.push({
            id: i,
            buildingId: 105,
            required: target,
        })
    }
    //成就 :觉醒层级成就
    for (let i = 1; i <= 25; i++) {
        let target = i <= 10 ? N(10).pow(i-1) : N(1e10).pow(i-10);
        achievements.push({
            id: i,
            buildingId: 106,
            required: target,
        })
    }
    //成就 :其他……
    return achievements;
})();
const ASCENDU = (() => {
    const ascendU = [];
    ascendU.push({ id: 1, cost: N(1), maxLevel: N(1) });//解锁飞升系统
    ascendU.push({ id: 2, cost: N(3), maxLevel: N(3) });//佩干产量乘数+10% 3,3e3,3e6
    ascendU.push({ id: 3, cost: N(5), maxLevel: N(5) });//解锁风味佩干 5+n*10
    ascendU.push({ id: 4, cost: N(7), maxLevel: N(7) });//离线时长 7^(n+1)
    ascendU.push({ id: 5, cost: N(50), maxLevel: N(2) });//初始拥有10建筑1或2 50*10^2n
    ascendU.push({ id: 6, cost: N(77), maxLevel: N(10) });//金佩干出现频率提升10% 77*10^2n
    ascendU.push({ id: 7, cost: N(100), maxLevel: N(5) });//背包 n*10^2n
    ascendU.push({ id: 8, cost: N(777), maxLevel: N(10) });//金佩干技能时间提升10% 777*10^2n
    ascendU.push({ id: 9, cost: N(999), maxLevel: N(6) });//禁用金佩干，pps+40+10等级% 999*10^3n
    ascendU.push({ id: 10, cost: N(9000), maxLevel: N(10) });//牛奶效果加成
    ascendU.push({ id: 11, cost: N(99999), maxLevel: N(10) });//建筑、升级价格降低2% 99999*10^5n
    ascendU.push({ id: 12, cost: N(222222), maxLevel: N(2) });//解锁协同升级，当拥有15和75个建筑时出现
    ascendU.push({ id: 13, cost: N(399999), maxLevel: N(1) });//升级价格除以5
    ascendU.push({ id: 14, cost: N(1.5e7), maxLevel: N(1) });//1-6到1-20的乘数变为1000
    ascendU.push({ id: 15, cost: N(1e8), maxLevel: N(10) });//糖块生长10%更快
    ascendU.push({ id: 16, cost: N(2e8), maxLevel: N(10) });//释放糖块力量
    ascendU.push({ id: 17, cost: N(1e9), maxLevel: N(6) });//禁用点击，pps+40+10等级% 10^(2n+9)
    ascendU.push({ id: 18, cost: N(2e9), maxLevel: N(1) });//建筑2升级变为x3.2
    ascendU.push({ id: 19, cost: N(9e9), maxLevel: N(5) });//每级每个牛奶升级增加建筑29%
    ascendU.push({ id: 20, cost: N(3.2e10), maxLevel: N(40) });//解锁不受束缚的升级
    return ascendU;
})();
const TRANSCENDU = (() =>{
    const transcendU = [];
    for(let i=1;i<=12;i++) transcendU.push({ id: i, cost: N(1), maxLevel: N(9990)});
    transcendU.push({ id: 13, cost: N(10), maxLevel: N(1) });//轮回和飞升保留建筑
    transcendU.push({ id: 14, cost: N(100), maxLevel: N(1) });//禁用效果常时生效
    transcendU.push({ id: 15, cost: N(1000), maxLevel: N(1) });//金佩勒效果乘100
    transcendU.push({ id: 16, cost: N(10000), maxLevel: N(1) });//点击增加
    transcendU.push({ id: 17, cost: N(1e6), maxLevel: N(15) });//糖块生长增加20%
    transcendU.push({ id: 18, cost: N(1e6), maxLevel: N(15) });//金佩勒出现频率增加5%
    transcendU.push({ id: 19, cost: N(1e8), maxLevel: N(4) });//解锁更多风味佩干
    transcendU.push({ id: 20, cost: N(1e8), maxLevel: N(4) });//解锁糖块升级
    return transcendU;
})();
const HYPERCENDU = (() => {
    const hypercendU = [];
    hypercendU.push({ id: 1, cost: N(1), maxLevel: N(100) });//解锁觉醒充能，每级每秒获得1充能
    hypercendU.push({ id: 2, cost: N(1e6), maxLevel: N(100) });//解锁更多风味，充能率+49%每级
    hypercendU.push({ id: 3, cost: N(1e12), maxLevel: N(100) });//解锁更多风味，充能率+19%每级
    hypercendU.push({ id: 4, cost: N(1e18), maxLevel: N(100) });//解锁更多风味，充能率+9%每级
    hypercendU.push({ id: 5, cost: N(1e24), maxLevel: N(100) });//解锁更多风味，充能率+4%每级
    hypercendU.push({ id: 6, cost: N(1e100), maxLevel: N(100) });//解锁更多风味，充能率+1%每级
    return hypercendU;
})();
const HYPERCHARGEU = (() => {
    const hyperchargeU = [];
    const cost=[5,10,15,30,100,300,1500,6000,5e5,1e7,1e8,1e9,1e10,1e12,1e14,1e16,"1e500","1e700","1e850","1e1000", "1e5000", "1e7500", "1e10000", "1e15000"];
    for(let i=0;i<24;i++) hyperchargeU.push({ id: i+1, cost:N(cost[i]), unlocked:false });//根据你的觉醒点数提升佩干获取和觉醒充能速度
    return hyperchargeU;
})();
const AUTOMATION = (() => {
    const automation = [];
    const cost=[1e5,1e10,2.5e25,7.7e77,1e20,1e40,1e80,1e160,"1e640","1e5000","1e7500","1e10000","1e15000","1e22000","1e33000","1e50000","1e75000","1e100000","1e150000","1e220000","1e330000","1e500000","1e750000","1e1000000","1e1500000","1e2200000","1e3300000","1e5000000","1e7500000","1e10000000"]
    for(let i=0;i<30;i++){
        automation.push({id:i+1, cost: N(cost[i]), unlocked:false, activate: false});//自动购买
    }
    return automation;
})();
const SPACEU = (() => {
    const spaceU = [];
    spaceU.push({ id: 1, basecost:N(1), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 2, basecost:N(1), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 3, basecost:N(100), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 4, basecost:N(100), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 5, basecost:N(10000), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 6, basecost:N(10000), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 7, basecost:N(1e6), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 8, basecost:N(1e6), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 9, basecost:N(1e8), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 10, basecost:N(1e8), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 11, basecost:N(1e10), cost: N(1), maxLevel: N(10) });
    spaceU.push({ id: 12, basecost:N(1e10), cost: N(1), maxLevel: N(10) });
    return spaceU;
})();
const SALTU =(() => {
    const saltU = [];
    saltU.push({ id: 1, basecost:N(1), cost: N(1), maxLevel: N(9) });
    saltU.push({ id: 2, basecost:N(10), cost: N(1), maxLevel: N(9) });
    saltU.push({ id: 3, basecost:N(100), cost: N(1), maxLevel: N(9) });
    saltU.push({ id: 4, basecost:N(1000), cost: N(1), maxLevel: N(9) });
    return saltU;
})();
const REFINERYU = (() => {
    const refineryU = [];
    refineryU.push({ id: 1, basecost:N(1), cost: N(1), maxLevel: N(100) });
    refineryU.push({ id: 2, basecost:N(1), cost: N(1e6), maxLevel: N(100) });
    refineryU.push({ id: 3, basecost:N(1), cost: N(1e12), maxLevel: N(100) });
    refineryU.push({ id: 4, basecost:N(1), cost: N(1e18), maxLevel: N(100) });
    refineryU.push({ id: 5, basecost:N(1), cost: N(1e24), maxLevel: N(100) });
    return refineryU;
})();
const CONDENSERYU = (() => {
    const condenseryU = [];
    condenseryU.push({ id: 1, basecost:N(1), cost: N(1), maxLevel: N(100) });
    condenseryU.push({ id: 2, basecost:N(1), cost: N(1e6), maxLevel: N(100) });
    condenseryU.push({ id: 3, basecost:N(1), cost: N(1e12), maxLevel: N(100) });
    condenseryU.push({ id: 4, basecost:N(1), cost: N(1e18), maxLevel: N(100) });
    condenseryU.push({ id: 5, basecost:N(1), cost: N(1e24), maxLevel: N(100) });
    return condenseryU;
})();
const milkUpgradeBase=[
    4,5,6,7,8,8,8,8,8,7,
    6,5,4,4,4,4,1,1,1,1,
    1,2,2,2,2,2,3,3,3,3,
    3,5,5,5,6,6,6,7,7,7,
];
const milkUpgradeBase2=[
    9,9,9,9,9,10,10,10,10,10,
    1,2,3,4,5,6,7,8,9,10,
    1,2,3,4,5,6,7,8,9,10,
    1,2,3,4,5,6,7,8,9,10,
]
function getDefaultData() {
    return {
        lastUpdate: 0,
        backgroundDelta: 0,
        currentTab: 0,
        currentArea: 1,
        tabs: ['建筑', '升级', '成就', '传送', '飞升', '轮回', '破碎', '觉醒', '自动', '充能', '统计', '杂项',
        '简介', '生命', '声望', '性状', '变甜', '炼糖厂',
        '太空重置', '太空升级', '盐块', '高级成就', '香料', '蚁丘', '挑战', '巫师塔',
        '简介', '天体', '声望', '增强', '梦游', '天文研究', '炼乳厂', '星座',
        '简介', '探索区域', '探索成就', '高级自动', '声望', '高级升级', '终末', '层级'],
        currentLanguage: 'zh',
        texts: null,
        peiCount: N(0),
        thisAscendPei: N(0),
        totalLifetimePei: N(0),
        totalClickPei: N(0),
        peiPerSecond: N(0),
        peiPerClick: N(1),
        bulkAmount: 1,
        exploreBulkAmount: 1,
        goldenPeiClick: 0,
        goldenPeiTimer: 0,
        goldenPeiVisible: false,
        goldenPeiEffects: {
            clickMultiplier: N(1),
            buildingMultiplier: N(1),
            buildingCostReduction: N(1),
            upgradeCostReduction: N(1),
            randomBuildingBoost: null
        },
        effect: `无`,
        activeEffects: [],
        effectTimers: {},
        clickEffects: [],
        enableGolden: true,
        enableClick: true,
        upgShowType: 1,
        achShowType: 1,
        buildings: Array.from({ length: 42 }, (_, i) => ({
            id: i,
            quantity: N(0),
            baseCost: N(10).pow(i * (i - 1) / 40 + i + 1),
            cost: N(10).pow(i * (i - 1) / 40 + i + 1),
            baseProd: N(8).pow(i - 1),
            production: N(8).pow(i - 1),
        })),
        upgrades: UPGRADES.map(u => ({
            ...u,
            unlocked: false,
        })),
        achievements: ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: false,
        })),
        ascensionCount: N(0),
        realityShards: N(0),
        totalRealityShards: N(0),
        ascendU: ASCENDU.map(r => ({
            ...r,
            level: N(0),
        })),
        transcensionCount: N(0),
        transcendPoints: N(0),
        totalTranscendPoints: N(0),
        transcendU: TRANSCENDU.map(r => ({
            ...r,
            level: N(0),
        })),
        breakCount: N(0),
        breakTimer: N(0),
        hypercendCount: N(0),
        hypercendPoints: N(0),
        totalHypercendPoints: N(0),
        maxHypercendPoints: N(0),
        hyperCharge: N(0),
        hypercendU: HYPERCENDU.map(r => ({
            ...r,
            level: N(0),
        })),
        hyperChargeU: HYPERCHARGEU.map(r => ({
            ...r,
            level: N(0),
        })),
        automation: AUTOMATION.map(a => ({
            ...a,
        })),
        nutCount: N(0),
        spaceResetCount: N(0),
        spaceRecord: N(0),
        nobreakRecord: N(0),
        spaceU: SPACEU.map(u => ({
            ...u,
            level: N(0),
        })),
        saltU: SALTU.map(u => ({
            ...u,
            level: N(0),
        })),
        unlockedMesval: false,
        fosskie: N(0),
        totalFosskie: N(0),
        resetFosskie: N(0),
        icing: N(0),
        totalIcing: N(0),
        honey: N(0),
        totalHoney: N(0),
        sweetenCount: N(0),
        caramel: N(0),
        totalCaramel: N(0),
        sugarCharge: N(0),
        bulkLifeAmount: 1,
        peiLives: Array(28).fill().map((_, i) => ({
            id: i + 1,
            level: N(0),
            progress: 0,
            auto: false,
            timer: null,
            duration: i == 27 ? 9e15 : Math.pow(10, i / 10 + 0.4),
            baseCost: N(12).pow(i + 1),
            baseProd: N(8).pow(i + 1)
        })),
        traits: Array(42).fill().map((_, i) => ({
            id: i + 1,
            tier: i < 27 ? 1 : i < 39 ? 2 : i < 42 ? 3 : 0,
            level: N(0),
            cost: N(1)
        })),
        refineryU: REFINERYU.map(r => ({
            ...r,
            level: N(0),
        })),
        unlockedBeyond: false,
        starkie: N(0),
        totalStarkie: N(0),
        resetStarkie: N(0),
        cheese: N(0),
        totalCheese: N(0),
        cream: N(0),
        totalCream: N(0),
        dreamCount: N(0),
        butter: N(0),
        totalButter: N(0),
        milkCharge: N(0),
        milkLevel: N(0),
        milkExp: N(0),
        celetype: [0, 1, 1, 2, 1, 1, 3, 3, 3, 4,
            2, 4, 2, 4, 2, 4, 5, 6, 6, 6,
            6, 3, 5, 5, 5, 0, 7, 7, 7, 7,
            0, 0, 8, 8, 8, 8, 9, 9, 9, 9,
            10, 10, 10, 10, 11, 11, 11, 11, 12, 12,
            12, 12, 13, 13, 13, 13],
        bulkCeleAmount: 1,
        peiCeles: Array(56).fill().map((_, i) => ({
            id: i + 1,
            level: N(0),
            progress: 0,
            timer: null,
            duration: Math.pow(10, (i + 5) / 10),
            baseCost: Decimal.pow(10, 1 + i + i * (i + 1) / 20),
            baseProd: Decimal.pow(8, 1 + i + i * (i + 1) / 20).div(4),
        })),
        enhans: Array(40).fill().map((_, i) => ({
            id: i + 1,
            tier: i < 15 ? 1 : i < 30 ? 2 : i < 40 ? 3 : 0,
            level: N(0),
            cost: N(1),
        })),
        astroResearch: Array(20).fill().map((_, i) => ({
            id: i + 1,
            level: N(0),
            duration: N(100),
            progress: 0,
            timer: null,
            active: false,
        })),
        condenseryU: CONDENSERYU.map(c => ({
            ...c,
            level: N(0),
        })),
        unlockedExplor: false,
        datakie: N(0),
        totalDatakie: N(0),
        advancedAchievements: [
            { id: 1, description: '获得大量佩干', completedTimes: N(0), type: 'pelkie' },
            { id: 2, description: '获得大量化石饼干', completedTimes: N(0), type: 'fosskie' },
            { id: 3, description: '获得大量星尘饼干', completedTimes: N(0), type: 'starkie' },
            { id: 4, description: '获得大量数据饼干', completedTimes: N(0), type: 'datakie' },
        ],
        cinnamon: N(0),
        vanilla: N(0),
        cinnamonResetCount: N(0),
        vanillaResetCount: N(0),
        antHillLevel: N(0),
        antReleaseSpeed: N(0),
        antsNotDriven: N(0),
        antsDriven: N(0),
        challenges: [
            { id: 1, name: '无飞升挑战', description: '不能获得飞升点', completedTimes: N(0), active: false },
            { id: 2, name: '无轮回挑战', description: '不能获得飞升点和轮回点', completedTimes: N(0), active: false },
            { id: 3, name: '无破碎挑战', description: '不能获得飞升点和轮回点，破碎次数不能超过8', completedTimes: N(0), active: false },
            { id: 4, name: '无觉醒挑战', description: '不能获得飞升点、轮回点、觉醒充能，破碎次数不能超过1', completedTimes: N(0), active: false },
            { id: 5, name: '困难挑战', description: '不能获得飞升点、轮回点、觉醒充能，破碎次数不能超过1，佩干产量^0.75', completedTimes: N(0), active: false }
        ],
        totalChallengeCompletions: N(0),
        milk: N(0),
        sugar: N(0),
        salt: N(0),
        playTime: 0,
        playTime2: 0,
        totalPlayTime: 0,
        lastUpdateTime: Date.now(),
        constellationFragments: N(0),
        totalConstellationFragments: N(0),
        constellationUpgrades: Array(12).fill().map((_, i) => ({
            id: i + 1,
            active: false,
            cost: [4, 4, 5, 5, 6, 6, 7, 8, 9, 10, 12, 15][i],
        })),
        magicPoints: N(0),
        magicAmount: N(0),
        magicCap: N(100),
        magicProduction: N(1),
        magicUpgrades: [N(0), N(0), N(0), N(0)],
        magicSkills: [
            { id: 1, active: false, timer: 0, duration: 60, cost: 100 },
            { id: 2, active: false, timer: 0, duration: 60, cost: 200 },
            { id: 3, active: false, timer: 0, duration: 60, cost: 300 },
            { id: 4, active: false, timer: 0, duration: 60, cost: 400 },
        ],
        exploreArea: Array.from({ length: 14 }, (_, i) => ({
            id: i,
            quantity: N(0),
            baseCost: N(1e6).pow(i-1),
            cost: N(1e6).pow(i-1),
            baseProd: N(1e4).pow(i-1),
            production: N(1e4).pow(i-1),
        })),
        eggs: N(0),
        chickens: N(0),
        flour: N(0),
        exploreAchievements: Array.from({ length: 150 }, (_, i) => ({
            id: i + 1,
            unlocked: false,
        })),
        advancedAutomation: Array.from({ length: 11 }, (_, i) => ({
            id: i + 1,
            unlocked: false,
            activate: false,
            cost: N(10).pow(i + 1),
        })),
        matcha: N(0),
        totalMatcha: N(0),
        coffee: N(0),
        totalCoffee: N(0),
        matchaResetCount: N(0),
        coffeeResetCount: N(0),
        exploreUpgrades: Array.from({ length: 14 }, (_, i) => ({
            id: i + 1,
            level: N(0),
            maxLevel: N(100),
            cost: N(10).pow(i * 3 + 10),
        })),
        gelatin: N(0),
        endCount: N(0),
        terminalUpgrades: Array.from({ length: 5 }, (_, i) => ({
            id: i + 1,
            level: N(0),
            maxLevel: N(100),
            cost: N(10).pow(i * 5 + 20),
        })),
    };
}

const SAVE_SCHEMA = {
    simple: [
        'peiCount', 'thisAscendPei', 'totalLifetimePei', 'totalClickPei',
        'ascensionCount', 'realityShards', 'totalRealityShards',
        'transcensionCount', 'transcendPoints', 'totalTranscendPoints',
        'breakCount', 'breakTimer',
        'hypercendCount', 'hypercendPoints', 'totalHypercendPoints', 'maxHypercendPoints', 'hyperCharge',
        'nutCount', 'spaceResetCount', 'spaceRecord', 'nobreakRecord',
        'fosskie', 'totalFosskie', 'resetFosskie',
        'icing', 'totalIcing', 'honey', 'totalHoney',
        'sweetenCount', 'caramel', 'totalCaramel', 'sugarCharge',
        'milkLevel', 'milkExp',
        'starkie', 'totalStarkie', 'resetStarkie',
        'cheese', 'totalCheese', 'cream', 'totalCream',
        'dreamCount', 'butter', 'totalButter', 'milkCharge',
        'cinnamon', 'vanilla', 'cinnamonResetCount', 'vanillaResetCount',
        'antHillLevel', 'antsNotDriven', 'antsDriven',
        'milk', 'sugar', 'salt',
        'totalChallengeCompletions',
        'constellationFragments', 'totalConstellationFragments',
        'magicPoints', 'magicAmount', 'magicCap', 'magicProduction',
        'eggs', 'chickens', 'flour',
        'datakie', 'totalDatakie',
        'matcha', 'totalMatcha', 'coffee', 'totalCoffee',
        'matchaResetCount', 'coffeeResetCount',
        'gelatin', 'endCount',
    ],
    booleanTrue: ['enableClick', 'enableGolden'],
    number: ['goldenPeiClick', 'playTime', 'playTime2', 'totalPlayTime'],
    arrayProps: [
        ['buildings', 'buildings', 'quantity'],
        ['upgrades', 'upgrades', 'unlocked'],
        ['achievements', 'achievements', 'unlocked'],
        ['ascendU', 'ascendU', 'level'],
        ['transcendU', 'transcendU', 'level'],
        ['hypercendU', 'hypercendU', 'level'],
        ['hyperChargeU', 'hyperChargeU', 'unlocked'],
        ['spaceU', 'spaceU', 'level'],
        ['saltU', 'saltU', 'level'],
        ['peiLives', 'peiLives', 'level'],
        ['traits', 'traits', 'level'],
        ['refineryU', 'refineryU', 'level'],
        ['peiCeles', 'peiCeles', 'level'],
        ['enhans', 'enhans', 'level'],
        ['astroResearch', 'astroResearch', 'level'],
        ['condenseryU', 'condenseryU', 'level'],
        ['exploreArea', 'exploreArea', 'quantity'],
        ['exploreUpgrades', 'exploreUpgrades', 'level'],
        ['terminalUpgrades', 'terminalUpgrades', 'level'],
    ],
    arrayExtraProps: [
        ['automation', 'automationu', 'unlocked'],
        ['automation', 'automationa', 'activate'],
        ['peiLives', 'peiLivesAuto', 'auto'],
        ['advancedAutomation', 'advAutoU', 'unlocked'],
        ['advancedAutomation', 'advAutoA', 'activate'],
    ],
    idMatched: [
        ['advancedAchievements', ['id', 'completedTimes']],
        ['challenges', ['id', 'completedTimes']],
        ['constellationUpgrades', ['id', 'active']],
        ['magicSkills', ['id', 'active', 'timer']],
        ['exploreAchievements', ['id', 'unlocked']],
    ],
};

const SPACE_MILESTONES = [
    { type: 'spaceReset', val: 1, text1: 't18_11', text2: 't18_12' },
    { type: 'spaceRecord', val: '1e40000', text1: 't18_13', text2: 't18_14' },
    { type: 'spaceRecord', val: '1e60000', text1: 't18_15', text2: 't18_16' },
    { type: 'spaceRecord', val: '1e80000', text1: 't18_17', text2: 't18_18' },
    { type: 'nobreak', val: '1e30000', text1: 't18_19', text2: 't18_20' },
    { type: 'nobreak', val: '1e50000', text1: 't18_21', text2: 't18_22', extra: 'hyperArtifact12' },
    { type: 'nobreak', val: '1e100000', text1: 't18_23', text2: 't18_24', extra: 'nuts' },
    { type: 'nobreak', val: '1e300000', text1: 't18_25', text2: 't18_26' },
];

const SPICE_MILESTONES = [
    { type: 'or', val: 1, text1: 't22_13', text2: 't22_14' },
    { type: 'and', val: 1, text1: 't22_15', text2: 't22_16' },
    { type: 'and', val: 2, text1: 't22_17', text2: 't22_18' },
    { type: 'and', val: 4, text1: 't22_19', text2: 't22_20' },
];

export default {
    data() {
        return getDefaultData();
    },
    methods: {
        t(textKey) {
            return this.texts[this.currentLanguage][textKey] || textKey;
        },
        spaceMilestoneUnlocked(m) {
            if (m.type === 'spaceReset') return this.spaceResetCount.gte(m.val);
            if (m.type === 'spaceRecord') return this.spaceRecord.gte(m.val);
            if (m.type === 'nobreak') return this.nobreakRecord.gte(m.val);
            return false;
        },
        spiceMilestoneUnlocked(m) {
            if (m.type === 'or') return this.cinnamonResetCount.gte(m.val) || this.vanillaResetCount.gte(m.val);
            if (m.type === 'and') return this.cinnamonResetCount.gte(m.val) && this.vanillaResetCount.gte(m.val);
            return false;
        },
        toggleLanguage() {
            this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        },
        showTab(i) {
            // 使用 Set.has() 替代 Array.includes()，O(1) 查找
            if(this.currentArea == 1){
                if(this.breakCount.lt(1)) return this._tabSet1a.has(i);
                else return this._tabSet1b.has(i);
            }
            if(this.currentArea == 2) return this._tabSet2.has(i);
            if(this.currentArea == 3) return this._tabSet3.has(i);
            if(this.currentArea == 4) return this._tabSet4.has(i);
            if(this.currentArea == 5) return this._tabSet5.has(i);
            //if(this.currentArea == 6) return[3,11,40,41,42,43,44,45,46,47,48,49].includes(i);
        },
        clickPei() {
            if(this.currentArea==1){
                if(!this.enableClick) return;
                this.peiCount = this.peiCount.add(this.peiPerClick);
                this.totalClickPei = this.totalClickPei.add(this.peiPerClick);
                this.thisAscendPei = this.thisAscendPei.add(this.peiPerClick);
                this.totalLifetimePei = this.totalLifetimePei.add(this.peiPerClick);
                this.addClickEffect(this.peiPerClick);
            }
            else if(this.currentArea==2){
                this.fosskie = this.fosskie.add(this.fosskiePerClick);
                this.totalFosskie = this.totalFosskie.add(this.fosskiePerClick);
                this.resetFosskie = this.resetFosskie.add(this.fosskiePerClick);
                this.addClickEffect(this.fosskiePerClick);
            }
            else if(this.currentArea==4){
                this.starkie = this.starkie.add(this.starkiePerClick);
                this.totalStarkie = this.totalStarkie.add(this.starkiePerClick);
                this.resetStarkie = this.resetStarkie.add(this.starkiePerClick);
                this.addClickEffect(this.starkiePerClick);
            }
        },
        addClickEffect(amount) {
            const effect = {
                amount: amount,
                style: {
                    animationDuration: `2s`
                }
            };
            this.clickEffects.push(effect);
            // 2秒后移除效果
            setTimeout(() => {
                this.clickEffects = this.clickEffects.filter(e => e !== effect);
            }, 2000);
        },
        switchClick() {
            this.enableClick = !this.enableClick;
        },
        switchGolden(){
            this.enableGolden = !this.enableGolden;
        },
        clickGoldenPei() {
            if (!this.goldenPeiVisible || !this.enableGolden) return;
            this.goldenPeiClick++;
            const durationMult = this.ascendU[5].level.mul(0.1).add(1).toNumber();
            const effectMult = this.transcendU[5].level.mul(0.1).add(1).toNumber();
            const effectmult2 = this.transcendU[14].level.gte(1)?10:1;
            let effects=[];
            if(this.hypercendU[3].level.gte(1)){
                effects = [
                {
                    name: '获得'+(15*effectMult*effectmult2).toFixed(1)+'<del>分钟</del>产量的佩干',
                    chance: 9,
                    apply: () => this.gainProduction(15*effectMult*effectmult2)
                },
                {
                    name: '获得'+this.sugarGain.toNumber().toFixed(0)+'个糖块',
                    chance: 1,
                    apply: () => this.gainCandy(this.sugarGain)
                },
                ]
            }
            else {
                effects = [
                {
                    name: '获得'+(15*effectMult*effectmult2).toFixed(1)+'<del>分钟</del>产量的佩干',
                    chance: 9,
                    apply: () => this.gainProduction(15*effectMult*effectmult2)
                },
                {
                    name: '获得的佩干×'+ (6*effectMult).toFixed(1) +'，持续'+ (66*durationMult).toFixed(1) +'秒',
                    chance: 6,
                    apply: () => this.applyBuildingMultiplier(6*effectMult, 66*durationMult)
                },
                {
                    name: '点击获得的佩干×'+(666*effectMult).toFixed(1)+'，持续'+(13*durationMult).toFixed(1)+'秒',
                    chance: 6,
                    apply: () => this.applyClickMultiplier(666*effectMult, 13*durationMult)
                },
                {
                    name: '随机建筑提升<del>佩干产量，基于该建筑数量×</del>'+(10*effectMult*effectmult2).toFixed(1)+'%，持续'+(30*durationMult).toFixed(1)+'秒',
                    chance: 4,
                    apply: () => this.boostRandomBuilding(1+0.1*effectMult*effectmult2, 30*durationMult)
                },
                {
                    name: '获得的佩干×'+(15*effectMult).toFixed(1)+'，持续'+(30*durationMult).toFixed(1)+'秒',
                    chance: 3,
                    apply: () => this.applyBuildingMultiplier(15*effectMult, 30*durationMult)
                },
                {
                    name: '点击获得的佩干×'+(1111*effectMult).toFixed(1)+'，持续'+(8*durationMult).toFixed(1)+'秒',
                    chance: 3,
                    apply: () => this.applyClickMultiplier(1111*effectMult, 8*durationMult)
                },
                {
                    name: '建筑价格-'+(100-50/effectMult).toFixed(1)+'%，持续'+(5*durationMult).toFixed(1)+'秒',
                    chance: 2,
                    apply: () => this.applyBuildingCostReduction(0.5/effectMult, 5*durationMult)
                },
                {
                    name: '升级价格-'+(100-50/effectMult).toFixed(1)+'%，持续'+(5*durationMult).toFixed(1)+'秒',
                    chance: 2,
                    apply: () => this.applyUpgradeCostReduction(0.5/effectMult, 5*durationMult)
                },
                {
                    name: '获得'+this.sugarGain.toNumber().toFixed(0)+'个糖块',
                    chance: 1,
                    apply: () => this.gainCandy(this.sugarGain)
                },
                ];
            }
            const allEffects = [...effects];
            const selectedEffect = this.selectRandomEffect(allEffects);
            selectedEffect.apply();
            this.goldenPeiVisible = false;
            this.showEffectNotification(selectedEffect.name);
        },
        applyClickMultiplier(multiplier, duration) {
            this.goldenPeiEffects.clickMultiplier = N(multiplier);
            this.startEffectTimer('clickMultiplier', () => {
                this.goldenPeiEffects.clickMultiplier = N(1);
            }, duration * 1000);
        },
        applyBuildingMultiplier(multiplier, duration) {
            this.goldenPeiEffects.buildingMultiplier = N(multiplier);
            this.startEffectTimer('buildingMultiplier', () => {
                this.goldenPeiEffects.buildingMultiplier = N(1);
            }, duration * 1000);
        },
        applyBuildingCostReduction(factor, duration) {
            this.goldenPeiEffects.buildingCostReduction = N(factor);
            this.startEffectTimer('buildingCostReduction', () => {
                this.goldenPeiEffects.buildingCostReduction = N(1);
            }, duration * 1000);
        },
        applyUpgradeCostReduction(factor, duration) {
            this.goldenPeiEffects.upgradeCostReduction = N(factor);
            this.startEffectTimer('upgradeCostReduction', () => {
                this.goldenPeiEffects.upgradeCostReduction = N(1);
            }, duration * 1000);
        },
        boostRandomBuilding(multiplier, duration) {
            const buildingsWithQuantity = this.buildings.filter(b => b.quantity.gt(0));
            if (buildingsWithQuantity.length === 0) return;
            const randomBuilding = buildingsWithQuantity[
                Math.floor(Math.random() * buildingsWithQuantity.length)
            ];
            this.goldenPeiEffects.randomBuildingBoost = randomBuilding.id;
            this.startEffectTimer('randomBuildingBoost', () => {
                this.goldenPeiEffects.randomBuildingBoost = null;
            }, duration * 1000);
        },
        gainProduction(seconds) {
            const production = this.peiPerSecond.mul(seconds);
            this.peiCount = this.peiCount.add(production);
            this.thisAscendPei = this.thisAscendPei.add(production);
            this.totalLifetimePei = this.totalLifetimePei.add(production);
        },
        gainClicks(count) {
            const total = this.peiPerClick.mul(count);
            this.peiCount = this.peiCount.add(total);
        },
        gainCandy(count) {
            this.sugar = this.sugar.add(count);
        },
        selectRandomEffect(effects) {
            const totalWeight = effects.reduce((sum, e) => sum + e.chance, 0);
            let random = Math.random() * totalWeight;
            for (const effect of effects) {
                if (random < effect.chance) return effect;
                random -= effect.chance;
            }
            return effects[0];
        },
        startEffectTimer(name, callback, duration) {
            if (this.effectTimers[name]) {
                clearTimeout(this.effectTimers[name]);
            }
            this.effectTimers[name] = setTimeout(() => {
                callback();
                delete this.effectTimers[name];
            }, duration);
        },
        showEffectNotification(effectName) {
            this.effect = effectName;
            document.getElementById('effectSpan').innerHTML = effectName;
            const toast = document.createElement('div');
            toast.className = 'effect-toast';
            toast.innerHTML = `
                <span>获得金佩勒效果:${effectName}</span>
    `       ;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        },
        buyBuilding(index) {
            let building = this.buildings[index];
            let amount = parseInt(this.bulkAmount);
            let totalCost = this.calcBulkCost(index);
            if (this.peiCount.lt(totalCost)) return;
            // 执行购买
            if(this.hypercendU[1].level.lt(1)) this.peiCount = this.peiCount.sub(totalCost);
            building.quantity = building.quantity.add(amount);
            // 更新下次购买价格（使用公式代替循环）
            building.cost = building.baseCost.mul(Decimal.pow(1.148698354997035, building.quantity));
            // 检查成就
            this.checkAchievements(index + 1);
        },
        buyMaxBuilding(index) {
            let building = this.buildings[index];
            let r = 1.148698354997035;
            let maxAmount = this.peiCount.div(this.buildingCostMult).div(building.cost).mul(r-1).add(1).log(r);
            let a = Decimal.max(Decimal.floor(maxAmount),0);
            let totalCost = Decimal.pow(r,a).sub(1).mul(building.cost).div(r-1).mul(this.buildingCostMult);
            if (this.peiCount.lt(totalCost)) return;
            this.peiCount = this.peiCount.sub(totalCost);
            building.quantity = building.quantity.add(a);
            building.cost = building.baseCost.mul(Decimal.pow(r, building.quantity));
            this.checkAchievements(index + 1);
        },
        buyAllBuilding() {
            if (this.hypercendU[1].level.lt(1)) {for(let i=41;i>=0;i--) this.buyMaxBuilding(i);}
            else {
                for(let i=41;i>=0;i--) {
                    let building = this.buildings[i];
                    if (this.peiCount.lt(building.cost.mul(this.buildingCostMult))) return;
                    let r = 1.148698354997035;
                    building.quantity = N(Math.floor(this.peiCount.div(this.buildingCostMult).div(building.baseCost).mul(r).max(1).log(r)));
                    building.cost = building.baseCost.mul(Decimal.pow(r, building.quantity));
                }
            }
        },
        buildingMult(index){
            if(index==0) {
                return this._getUpgradesByBuilding(1).filter(u => u.id < 4).reduce((prod, upgrade) => {
                        return upgrade.unlocked ? prod.mul(2) : prod;
                    }, N(1))
                    .add(this._getUpgradesByBuilding(1).find(u => u.id == 4).unlocked?
                        this._getUpgradesByBuilding(1).filter(u => u.id > 4 && u.id <= 20).reduce((prod, upgrade) => {
                            return upgrade.unlocked ? prod.mul(this.transcendU[6].level.mul(0.1).add(1).mul(this.transcendU[15].level.gte(1)?100:20).mul(this.breakCount.max(4).min(8).sub(3).mul(0.2).add(1))) : prod;
                        }, N(1))
                        .mul(this._getUpgradesByBuilding(1).filter(u => u.id>20).reduce((prod, upgrade, i) => {
                            return upgrade.unlocked ? prod.mul(Decimal.pow(4,this.buildings[index].quantity/100 - 10*(i+1)*(i+2))).mul(Decimal.pow(this.buildings[index].baseCost, 0.1)) : prod;
                        }, N(1)))
                        .mul(this.ascendU[13].level.gte(1)?25: 1).mul(this.buildingCount):N(0))
                    .mul(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*0.1+2:this.goldenPeiEffects.randomBuildingBoost == index ? 1.1 : 1);
            }
            else if(index==1) {
                return this._getUpgradesByBuilding(2).reduce((prod, upgrade) => {
                        return upgrade.unlocked ? prod.mul(this.ascendU[17].level.gte(1)?this.breakCount.gte(6)?6:3.2:2).mul(this.breakCount.max(3).min(8).sub(3).mul(0.2).add(1)) : prod;
                    }, N(1))
                    .mul(this._getUpgradesByBuilding(103).reduce((prod, upgrade) => {
                        return upgrade.unlocked ? prod.mul(this.ascendU[17].level.gte(1)?this.breakCount.gte(6)?6:3.2:2) : prod;
                    }, N(1)))
                    .mul(this._getUpgradesByBuilding(2).filter(u => u.id>20).reduce((prod, upgrade, i) => {
                        return upgrade.unlocked ? prod.mul(Decimal.pow(4,this.buildings[index].quantity/100 - 10*(i+1)*(i+2))).mul(Decimal.pow(this.buildings[index].baseCost, 0.1).mul(1e3)) : prod;
                    }, N(1)))
                    .mul(this.ascendU[18].level.mul(this.milk).mul(0.002).add(1))
                    .mul(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*0.1+2:this.goldenPeiEffects.randomBuildingBoost == index ? 1.1:1);
            }
            else{
                return this._getUpgradesByBuilding(index + 1).filter(u => u.id<=20).reduce((prod, upgrade) => {
                        return upgrade.unlocked ? prod.mul(this.ascendU[19].level.gte(index-1)?Math.pow(this.breakCount.gte(7)?1.109569472067845:1.05,42-index)*2:2).mul(this.breakCount.max(3).min(8).sub(3).mul(0.2).add(1)) : prod;
                    }, N(1))
                    .mul(this._getUpgradesByBuilding(index + 1).filter(u => u.id>20).reduce((prod, upgrade, i) => {
                        return upgrade.unlocked ? prod.mul(Decimal.pow(4,this.buildings[index].quantity/100 - 10*(i+1)*(i+2))).mul(Decimal.pow(this.buildings[index].baseCost, 0.1).mul(1e3)) : prod;
                    }, N(1)))
                    .mul(this._getUpgradesByBuilding(103).find(u => u.id == index - 1).unlocked ? this.buildings[1].quantity.div(index - 1).div(100).mul(this.transcendU[7].level.mul(0.1).add(1)).add(1) : 1)
                    .mul(this._getUpgradesByBuilding(108).find(u => u.id == index - 1      ).unlocked? this.buildings[index - 1      ].quantity.mul(0.01) .mul(this.transcendU[10].level.mul(0.1).add(1)).add(1):1)
                    .mul(this._getUpgradesByBuilding(108).find(u => u.id == (index+37)%40+1).unlocked? this.buildings[(index+37)%40+2].quantity.mul(0.001).mul(this.transcendU[10].level.mul(0.1).add(1)).add(1):1)
                    .mul(this._getUpgradesByBuilding(109).find(u => u.id == index - 1      ).unlocked? this.buildings[index-2        ].quantity.mul(0.01) .mul(this.transcendU[11].level.mul(0.1).add(1)).add(1):1)
                    .mul(this._getUpgradesByBuilding(109).find(u => u.id == (index+36)%40+1).unlocked? this.buildings[(index+36)%40+2].quantity.mul(0.001).mul(this.transcendU[11].level.mul(0.1).add(1)).add(1):1)
                    .mul(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*0.1+2:this.goldenPeiEffects.randomBuildingBoost == index ? 1.1 : 1);
            }
        },
        calcBulkCost(index) {
            let building = this.buildings[index];
            let r = 1.148698354997035; // 价格增长系数
            let n = parseInt(this.bulkAmount);
            let a1 = building.cost;
            if (n == 1) return a1.mul(this.buildingCostMult);
            // 使用等比数列求和公式：S = a1*(r^n - 1)/(r - 1)
            return Decimal.pow(r,n).sub(1).mul(a1).div(r-1).mul(this.buildingCostMult);
        },
        canBulkBuy(index) {
            return this.peiCount.gte(this.calcBulkCost(index));
        },
        buyUpgrade(i, b) {
            // 使用索引缓存快速查找，替代 filter 遍历 1400+ 个升级
            const upgrades = this._getUpgradesByBuilding(b);
            const upgrade = upgrades.find(u => u.id == i);
            if (!upgrade) return;
            let c = upgrade.cost.mul(this.upgradeCostMult);
            if (this.peiCount.gte(c)) {
                this.peiCount = this.peiCount.sub(c);
                upgrade.unlocked = true;
                this._unlockedUpgradesCount = (this._unlockedUpgradesCount || 0) + 1;
            }
        },
        // 判断是否可以购买升级
        canBuyUpgrade(upgrade) {
            let c = upgrade.cost.mul(this.upgradeCostMult);
            return this.peiCount.gte(c) & !upgrade.unlocked
        },
        showUpgrade(u) {
            if(this.upgShowType==1){
                if (u.unlocked) return false;
                else return ((u.buildingId < 100 && this.buildings[u.buildingId - 1].quantity.gte(u.required)) 
            || (u.buildingId == 101 && this.totalClickPei.gte(u.required)) 
            || (u.buildingId == 102 && N(this.unlockedAchievementsCount).gte(u.required)) 
            || (u.buildingId == 103 && this.buildings[u.id + 1].quantity.gte(u.required)) 
            || (u.buildingId == 104 && this.ascendU[0].level.gte(1)) 
            || (u.buildingId == 105 && this.ascendU[2].level.add(this.transcendU[18].level).gte(u.required) && this.thisAscendPei.gte(u.cost)) 
            || (u.buildingId == 106 && this.buildings[41].quantity.gte(u.required) && u.id<=16)
            || (u.buildingId == 107 && this.goldenPeiClick >= u.required)
            || (u.buildingId == 108 && this.ascendU[11].level.gte(1) && this.buildings[u.id + 1].quantity.gte(15))
            || (u.buildingId == 109 && this.ascendU[11].level.gte(2) && this.buildings[u.id + 1].quantity.gte(75))
            || (u.buildingId == 110 && this.transcendU[19].level.gte(u.required) && this.thisAscendPei.gte(u.cost))
                );
            }
            else if(this.upgShowType==2){
                return u.unlocked;
            }
        },
        buyAllUpgrades() {
            this.upgrades.forEach(u => {
                if (this.showUpgrade(u)) {
                    this.buyUpgrade(u.id, u.buildingId);
                }
            });
        },
        checkAchievements(buildingIndex) {
            // 使用预构建的成就索引替代 filter 遍历
            const relatedAchievements = this._achByBuilding[buildingIndex] || [];
            if (buildingIndex < 100) {
                const building = this.buildings[buildingIndex-1];
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & building.quantity.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 101) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.totalLifetimePei.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 102) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.peiPerSecond.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 103) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.totalClickPei.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 104) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.totalRealityShards.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 105) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.totalTranscendPoints.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
            if (buildingIndex == 106) {
                relatedAchievements.forEach(achievement => {
                    if (!achievement.unlocked & this.totalHypercendPoints.gte(achievement.required)) {
                        achievement.unlocked = true;
                        this.showAchievementToast(achievement);
                    }
                });
            }
        },
        showAchievementToast(achievement) {
            const toast = document.createElement('div');
            toast.className = 'achievement-toast';
            toast.innerHTML = `
        <span>成就 </span>
        <strong>${achievement.buildingId}-${achievement.id}</strong>
        <span> 已解锁</span>`
            ;
            document.body.appendChild(toast);
            this.milk = this.milk.add(this.breakCount.gte(3)?2:1);
            this._unlockedAchievementsCount = (this._unlockedAchievementsCount || 0) + 1;
            setTimeout(() => {
                toast.remove();
            }, 5000);
        },
        showAdvancedAchievementToast(achievement, times) {
            const toast = document.createElement('div');
            toast.className = 'achievement-toast';
            toast.innerHTML = `
        <span>高级成就 </span>
        <strong>${achievement.description}</strong>
        <span> 已完成${times}次</span>`
            ;
            document.body.appendChild(toast);
            this.milk = this.milkCount; // 每个高级成就增加(牛奶倍数)点牛奶
            setTimeout(() => {
                toast.remove();
            }, 5000);
        },
        // 检查高级成就
        checkAdvancedAchievements() {
            // 高级成就1：佩干
            const pelkieAchievement = this.advancedAchievements[0];
            const nextPelkieTarget = this.advancedAchievementsTarget(1);
            if (this.totalLifetimePei.gte(nextPelkieTarget)) {
                pelkieAchievement.completedTimes = pelkieAchievement.completedTimes.add(1);
                this.showAdvancedAchievementToast(pelkieAchievement, pelkieAchievement.completedTimes.toNumber());
            }
            // 高级成就2：化石
            const fosskieAchievement = this.advancedAchievements[1];
            const nextFosskieTarget = this.advancedAchievementsTarget(2);
            if (this.totalFosskie.gte(nextFosskieTarget)) {
                fosskieAchievement.completedTimes = fosskieAchievement.completedTimes.add(1);
                this.showAdvancedAchievementToast(fosskieAchievement, fosskieAchievement.completedTimes.toNumber());
            }
            // 高级成就3：星尘
            const starkieAchievement = this.advancedAchievements[2];
            const nextStarkieTarget = this.advancedAchievementsTarget(3);
            if (this.totalStarkie.gte(nextStarkieTarget)) {
                starkieAchievement.completedTimes = starkieAchievement.completedTimes.add(1);
                this.showAdvancedAchievementToast(starkieAchievement, starkieAchievement.completedTimes.toNumber());
            }
            /* 高级成就4：数据
            const datakieAchievement = this.advancedAchievements[3];
            const nextDatakieTarget = this.advancedAchievementsTarget(4);
            if (this.totalDatakie.gte(nextDatakieTarget)) {
                datakieAchievement.completedTimes = datakieAchievement.completedTimes.add(1);
                this.showAdvancedAchievementToast(datakieAchievement, datakieAchievement.completedTimes.toNumber());
            }*/
        },
        //计算高级成就目标
        advancedAchievementsTarget(tier) {
            if (tier == 1) {
                return Decimal.pow(10, this.advancedAchievements[0].completedTimes.add(1).mul(27000).mul(Decimal.pow(1.0333,this.advancedAchievements[0].completedTimes)));
            } else if (tier == 2) {
                return Decimal.pow(10, this.advancedAchievements[1].completedTimes.add(1).mul(900).mul(Decimal.pow(1.0333,this.advancedAchievements[1].completedTimes)));
            } else if (tier == 3) {
                return Decimal.pow(10, this.advancedAchievements[2].completedTimes.add(1).mul(30).mul(Decimal.pow(1.0333,this.advancedAchievements[2].completedTimes)));
            } else if (tier == 4) {
                return Decimal.pow(10, this.advancedAchievements[3].completedTimes.add(1).mul(Decimal.pow(1.0333,this.advancedAchievements[3].completedTimes)));
            }
        },
        ascend() {
            // 计算获得的碎片
            const gained = this.totalShards.sub(this.totalRealityShards).max(0);
            this.realityShards = this.realityShards.add(gained);
            this.totalRealityShards = this.totalShards.max(this.totalRealityShards);
            this.ascensionCount = this.ascensionCount.add(1);
            // 重置游戏状态
            this.peiCount = N(0);
            this.thisAscendPei = N(0);
            this.buildings.forEach(b => {
                b.quantity = N(0);
                b.cost = b.baseCost;
                b.production = b.baseProd;
            });
            this.upgrades.forEach(u => {
                u.unlocked = false;
            });
            let b1=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:this.spaceResetCount.gte(1)?1e4:this.breakCount.gte(1)?1000:this.transcendU[12].level.gte(1)?100:this.ascendU[4].level.gte(1)?10:0;
            let b2=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:this.spaceResetCount.gte(1)?1e4:this.breakCount.gte(1)?1000:this.transcendU[12].level.gte(1)?100:this.ascendU[4].level.gte(2)?10:0;
            this.buildings[0].quantity=N(b1);
            this.buildings[1].quantity=N(b2);
            for(let i=1; i<=this.ascendU[6].level.toNumber(); i++) this.upgrades[1070+i].unlocked=true;
        },
        buyAscendU(index) {
            const upgrade = this.ascendU[index];
            if (upgrade.level.gte(upgrade.maxLevel)) return;

            if (this.realityShards.gte(upgrade.cost)) {
                this.realityShards = this.realityShards.sub(upgrade.cost);
                this.ascendU[index].level = this.ascendU[index].level.add(1);
            }
            let a0=[1,3,5,7,50,77,100,777,999,9000,99999,222222,399999,1.5e7,1e8,2e8,1e9,1.92e9,9e9,1e10]
            let p=[0,1334,10,0,0,0,100,0,0,0,0,2e6,0,0,0,2e8,0,0,0,0]
            let q=[1,1,1,7,100,10,100,10,100,1e9,2,1,1,1,4,1000,10,1,1000,1]
            this.ascendU[index].cost = index==19?this.ascendU[19].level.add(3).pow(7).mul(1.5e7):N(a0[index]).add(this.ascendU[index].level.mul(p[index])).mul(Decimal.pow(q[index],this.ascendU[index].level))
        },
        buyAllAscendU() {
            this.ascendU.forEach(u => {
                for(let i=0;i<u.maxLevel.toNumber();i++) this.buyAscendU(u.id-1);
            });
        },
        refundAscendU() {
            var confirm=window.confirm("确认回退所有飞升升级吗？这将进行一次无奖励的飞升重置！");
            if(!confirm) return;
            this.ascendU.forEach(u => {
                u.level=N(0);
            });
            this.realityShards=this.totalRealityShards;
            this.ascend();
            this.updateCost();
        },
        transcend() {
            const gain = this.totalTP.sub(this.totalTranscendPoints).max(0);
            this.transcendPoints = this.transcendPoints.add(gain);
            this.totalTranscendPoints = this.totalTP.max(this.totalTranscendPoints);
            this.transcensionCount = this.transcensionCount.add(1);

            this.peiCount = N(0);
            this.thisAscendPei = N(0);
            this.totalClickPei = N(0);
            this.totalLifetimePei = N(0);
            this.enableClick=true;
            this.enableGolden=true;
            this.buildings.forEach(b => {
                b.quantity = N(0);
                b.cost = b.baseCost;
                b.production = b.baseProd;
            });
            this.upgrades.forEach(u => u.unlocked = false);
            this.ascensionCount = N(1);
            this.realityShards = N(1);
            this.totalRealityShards=N(1);
            this.ascendU.forEach(u => u.level = N(0));
            let b=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:this.spaceResetCount.gte(1)?1e4:this.breakCount.gte(1)?1000:this.transcendU[12].level.gte(1)?100:0;
            this.buildings[0].quantity=N(b);
            this.buildings[1].quantity=N(b);
            this.updateCost();
        },
        buyTranscendU(index) {
            const upgrade=this.transcendU[index];
            if (upgrade.level.gte(upgrade.maxLevel)) return;

            if(this.transcendPoints.gte(upgrade.cost)){
                this.transcendPoints = this.transcendPoints.sub(upgrade.cost);
                upgrade.level = upgrade.level.add(1);
            }
            let r=[1,1,1,1,1,1,1,1,1,1,1,1,10,100,1000,10000,1e5,1e5,1e6,1e6];
            let s=[2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,4,4,10,1e6]
            this.transcendU[index].cost=Decimal.pow(s[index],this.transcendU[index].level).mul(r[index]);
        },
        buyAllTranscendU(){
            this.transcendU.forEach(u => {
                for(let i=0;i<u.maxLevel.min(100).toNumber();i++) this.buyTranscendU(u.id-1);
            });
        },
        refundTranscendU() {
            var confirm=window.confirm("确认回退所有轮回神器和升级吗？这将进行一次无奖励的轮回重置！");
            if(!confirm) return;
            this.transcendU.forEach(u => {
                u.level=N(0);
            });
            this.transcendPoints=this.totalTranscendPoints;
            this.transcend();
            this.updateCost();
        },
        breakReset(){
            this.peiCount = N(0);
            this.thisAscendPei = N(0);
            this.totalClickPei = N(0);
            this.totalLifetimePei = N(0);
            this.breakTimer = N(0);
            this.enableClick=true;
            this.enableGolden=true;
            this.buildings.forEach(b => {
                b.quantity = N(0);
                b.cost = b.baseCost;
                b.production = b.baseProd;
            });
            this.upgrades.forEach(u => u.unlocked = false);
            this.ascensionCount = N(1);
            this.realityShards = N(1);
            this.totalRealityShards=N(1);
            this.ascendU.forEach(u => u.level = N(0));
            this.transcendCount = N(1);
            this.transcendPoints = N(1);
            this.totalTranscendPoints = N(1);
            this.transcendU.forEach(u => u.level=N(0));
            let b=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:this.spaceResetCount.gte(1)?1e4:this.breakCount.gte(1)?1000:0;
            this.buildings[0].quantity=N(b);
            this.buildings[1].quantity=N(b);
            if(this.breakCount.lte(0)) alert('/拜谢。不过，我们并不希望每获得1e12资源就重置并解锁下一种资源。你破碎了这个佩干宇宙，因此出现了4个新的选项卡。  佩勒：这次你可能早些时候就明白了，飞升轮回直到破碎，都是你自己创造的。由你自身思绪的残余所构成的事物，暗示了这一点。但是，你从未想过那会是你，对吧？');
        },
        doBreak(){
            this.breakReset();
            this.breakCount=this.breakCount.add(1);
            this.updateCost();
        },
        buyAuto(index){
            const upgrade=this.automation[index];
            if(this.peiCount.lt(upgrade.cost)) return;
            this.peiCount=this.peiCount.sub(upgrade.cost);
            upgrade.unlocked=true;
        },
        toggleAuto(index){
            const upgrade=this.automation[index];
            if(!upgrade.unlocked) return;
            upgrade.activate=!upgrade.activate;
        },
        hypercend(){
            this.hypercendPoints = this.hypercendPoints.add(this.HPGain);
            this.totalHypercendPoints = this.totalHypercendPoints.add(this.HPGain);
            this.maxHypercendPoints = this.maxHypercendPoints.max(this.HPGain);
            this.hypercendCount =  this.hypercendCount.add(1);
            this.breakReset();
            this.updateCost();
        },
        buyHypercendU(index){
            const upgrade=this.hypercendU[index];
            if (this.hypercendPoints.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)) return;
            this.hypercendPoints = this.hypercendPoints.sub(upgrade.cost);
            upgrade.level = upgrade.level.add(1);
            let t=[1,1e6,1e12,1e18,1e24,1e100]
            this.hypercendU[index].cost=Decimal.pow(1.148698354997035,upgrade.level).mul(t[index]);
        },
        buyMaxHypercendU(index){
            for(let i=1;i<=100;i++) this.buyHypercendU(index);
        },
        buyAllHypercendU(){
            for(let i=0;i<6;i++) this.buyHypercendU(i);
        },
        buyHyperChargeU(index){
            const upgrade=this.hyperChargeU[index];
            if (this.hypercendPoints.lt(upgrade.cost) | upgrade.unlocked) return;
            this.hypercendPoints = this.hypercendPoints.sub(upgrade.cost);
            upgrade.unlocked=true;
        },
        buyAllHyperChargeU(){
            for(let i=0;i<20;i++) this.buyHyperChargeU(i);
        },
        hyperEffect(tier){
            if(tier == 0) return this.hyperCharge.add(1);
            else if(tier == 1) return this.totalHypercendPoints.add(1).pow(2);
            else if(tier == 2) return this.maxHypercendPoints.add(1).pow(2);
            else if(tier == 3) return this.hypercendPoints.add(1).pow(2);
            else if(tier == 4) return this.transcendPoints.add(1).pow(1/24);
            else if(tier == 5) return this.HPGain.pow(2/3);
            else if(tier == 6) return this.transcendPoints.add(1).pow(1/24);
            else if(tier == 7) return this.maxHypercendPoints.add(1).pow(0.2).mul(this.breakTimer.div(100).min(9).add(1).pow(2));
            else if(tier == 8) return this.sugar.add(1).pow(1/6);
            else if(tier == 9) return this.transcendPoints.add(1).pow(1/16);
            else if(tier == 10) return N(1);
            else if(tier == 11) return this.sugar.add(1).pow(1/6);
            else if(tier == 12 | tier == 13) return N(this.totalLifetimePei.add(10).log(10)).pow(1/6);
            else if(tier == 14 | tier == 15 | tier == 16) return N(this.totalLifetimePei.add(10).log(10)).pow(1/9);
            else if(tier == 17) return this.salt.add(1).pow(1/12);
            else if(tier == 18) return Decimal.pow(this.hypercendPoints.add(10).log(10),1/6);
            else if(tier == 19) return this.nutCount.add(1).pow(1/24);
            else if(tier == 20) return N(4/3);
            else return N(1);
        },
        spaceReset() {
            if (!this.canSpaceReset) return;
            this.nutCount = this.nutCount.add(this.nutGain);
            this.spaceRecord = this.spaceRecord.max(this.totalLifetimePei);
            if(this.breakCount.lte(1)) this.nobreakRecord = this.nobreakRecord.max(this.totalLifetimePei);
            this.peiCount = N(0);
            this.totalLifetimePei=N(0);
            this.thisAscendPei = N(0);
            this.totalClickPei=N(0);
            if(this.spaceRecord.lt("1e40000")) this.sugar=N(0);
            this.realityShards = N(1);
            this.totalRealityShards = N(1);
            this.transcendPoints = N(1);
            this.totalTranscendPoints = N(1);
            this.breakCount=N(1);
            this.hypercendPoints=N(1);
            this.totalHypercendPoints=N(1);
            this.maxHypercendPoints=N(1);
            this.hyperCharge = N(0);
            this.buildings.forEach(b => { b.quantity = N(0); });
            this.upgrades.forEach(u => { u.unlocked=false; });
            this.ascendU.forEach(au => { au.level = N(0); });
            this.transcendU.forEach(tu => { tu.level = N(0); });
            this.hypercendU.forEach(hu => { hu.level = N(0); });
            this.hyperChargeU.forEach(hcu => { hcu.unlocked = false; })
            if(this.spaceRecord.lt("1e60000")) this.automation.forEach(a => {a.unlocked=false; a.activate=false;});
            this.fosskie=N(0);
            this.totalFosskie=N(0);
            this.resetFosskie=N(0);
            this.icing=N(0);
            this.totalIcing=N(0);
            this.honey=N(0);
            this.totalHoney=N(0);
            this.peiLives.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<28;i++) {
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;
            }
            for(let i=0;i<39;i++) {
                this.traits[i].level = N(0);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
            this.spaceResetCount = this.spaceResetCount.add(1);
            let b=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:this.spaceResetCount.gte(1)?1e4:0;
            this.buildings[0].quantity=N(b);
            this.buildings[1].quantity=N(b);
            this.updateCost();
        },
        buySpaceU(id) {
            const upgrade = this.spaceU.find(u => u.id === id);
            if (upgrade.level.gte(upgrade.maxLevel) || this.nutCount.lt(this.getSpaceUC(id))) return;
            this.nutCount = this.nutCount.sub(this.getSpaceUC(id));
            upgrade.level = upgrade.level.add(1);
            if(id==11) this.milk=this.milkCount;
        },
        buyAllSpaceU(){
            for(let i=0;i<12;i++) this.buySpaceU(i+1);
        },
        getSpaceUC(id){
            if(id<=10) return Decimal.pow(2,this.spaceU[id-1].level).mul(this.spaceU[id-1].basecost);
            else return Decimal.pow(20,this.spaceU[id-1].level).mul(100);
        },
        buySaltU(id) {
            const upgrade = this.saltU.find(u => u.id === id);
            if (upgrade.level.gte(upgrade.maxLevel) || this.salt.lt(this.saltU[id-1].basecost)) return;
            this.salt = this.salt.sub(this.saltU[id-1].basecost);
            upgrade.level = upgrade.level.add(1);
        },
        
        // 计算香料加成
        calculateSpiceBonus() {
            const totalSpice = (this.cinnamon.add(1)).mul(this.vanilla.add(1)).sub(1).mul(5).add(1);
            return totalSpice.mul(this.calculateAntBonus()).mul(this.calculateChallengeBonus());
        },
        // 肉桂重置
        cinnamonReset() {
            if (!this.canSpiceReset) return;
            const gain = this.cinnamonGain;
            this.cinnamon = this.cinnamon.add(gain);
            // 增加肉桂重置次数
            this.cinnamonResetCount = this.cinnamonResetCount.add(1);
            // 执行重置
            this.spiceReset();
            // 蚁丘解锁逻辑将在后面实现
        },
        
        // 香草重置
        vanillaReset() {
            if (!this.canSpiceReset) return;
            const gain = this.calculateSpiceGain;
            this.vanilla = this.vanilla.add(gain);
            // 增加香草重置次数
            this.vanillaResetCount = this.vanillaResetCount.add(1);
            // 执行重置
            this.spiceReset();
            // 挑战解锁逻辑将在后面实现
        },
        
        // 香料重置的公共逻辑
        spiceReset() {
            // 重置佩干的所有内容
            this.peiCount = N(0);
            this.thisAscendPei = N(0);
            this.totalLifetimePei = N(0);
            this.totalClickPei = N(0);
            this.realityShards = N(1);
            this.totalRealityShards = N(1);
            this.transcendPoints = N(1);
            this.totalTranscendPoints = N(1);
            this.breakCount=N(1);
            this.hypercendPoints=N(1);
            this.totalHypercendPoints=N(1);
            this.hyperCharge=N(0);
            this.buildings.forEach(b => {
                b.quantity = N(0);
                b.cost = b.baseCost;
                b.production = b.baseProd;
            });
            this.upgrades.forEach(u => {
                u.unlocked = false;
            });
            this.ascendU.forEach(u => {
                u.level = N(0);
            });
            this.transcendU.forEach(u => {
                u.level = N(0);
            });
            this.hypercendU.forEach(u => {
                u.level = N(0);
            });
            this.hyperChargeU.forEach(u => {
                u.unlocked = false;
            }); 
            if(!(this.cinnamonResetCount.gte(1) && this.vanillaResetCount.gte(1))){
                this.automation.forEach(a => {
                    a.unlocked = false;
                    a.activate = false;
                });
            }
            
            // 重置化石饼干的所有内容
            this.fosskie = N(0);
            this.totalFosskie = N(0);
            this.resetFosskie = N(0);
            this.icing = N(1);
            this.totalIcing = N(1);
            this.honey = N(1);
            this.totalHoney = N(1);
            this.sweetenCount = N(0);
            this.caramel = N(1);
            this.totalCaramel = N(1);
            this.sugarCharge = N(0);
            this.peiLives.forEach(l => {
                l.level = N(0);
            });
            this.traits.forEach(t => {
                t.level = N(0);
                t.cost= N(0);
            });
            this.refineryU.forEach(u => {
                u.level = N(0);
            });
            for(let i=0;i<28;i++) {
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;
            }

            // 重置第四层内容
            if(!(this.cinnamonResetCount.gte(2) && this.vanillaResetCount.gte(2))){
                this.spaceRecord = N(0);
                this.nobreakRecord = N(0);
            }
            this.nutCount = N(0);
            this.spaceU.forEach(u => {
                u.level = N(0);
            });
            if(!(this.cinnamonResetCount.gte(4) && this.vanillaResetCount.gte(4))){
                this.salt = N(0);
                this.saltU.forEach(u => {
                u.level = N(0);
                });
            }
            this.playTime2 = 0;
            this.advancedAchievements.forEach(aa => {
                aa.completedTimes = N(0);
            });
            
            // 重置佩干天体的前2层内容
            this.milkExp = N(0);
            this.milkLevel = N(0);
            this.starkie = N(0);
            this.totalStarkie = N(0);
            this.resetStarkie = N(0);
            this.cheese = N(1);
            this.totalCheese = N(1);
            this.cream = N(1);
            this.totalCream = N(1);
            this.peiCeles.forEach(c => {
                c.level = N(0);
            });
            for(let i=0;i<30;i++) {
                this.enhans[i].level = N(0);
                this.enhans[i].cost = N(0);
            }

            // 重置其他相关数据
            this.milk = N(0);
            this.sugar = N(0);
            this.playTime = 0;
            this.achievements.forEach(a => {
                a.unlocked = false;
            });
            let b=(this.cinnamonResetCount.gte(1) || this.vanillaResetCount.gte(1))?1e5:0;
            this.buildings[0].quantity=N(b);
            this.buildings[1].quantity=N(b);
            this.updateCost();
        },
        
        // 蚁丘相关方法
        // 计算蚂蚁释放速度
        calculateAntReleaseSpeed() {
            return Decimal.pow(2, this.antHillLevel).sub(1);
        },
        // 计算肉桂效果
        calculateCinnamonEffect() {
            const cinnamonAmount = this.cinnamon;
            if (cinnamonAmount.lte(100)) {
                return cinnamonAmount;
            } else if (cinnamonAmount.lte(40000)) {
                return N(100).add(cinnamonAmount.sub(100)).pow(0.5).mul(30);
            } else if (cinnamonAmount.lte(1.6e7)) {
                return N(100).add(30 * Math.sqrt(39900)).add((cinnamonAmount.sub(40000)).pow(0.25).mul(20));
            } else if (cinnamonAmount.lte(6.4e9)) {
                return N(100).add(30 * Math.sqrt(39900)).add(20 * Math.pow(1.6e7 - 40000, 0.25)).add((cinnamonAmount.sub(1.6e7)).pow(0.125).mul(10));
            } else {
                return N(100).add(30 * Math.sqrt(39900)).add(20 * Math.pow(1.6e7 - 40000, 0.25)).add(10 * Math.pow(6.4e9 - 1.6e7, 0.125)).add((cinnamonAmount.sub(6.4e9)).pow(0.0625).mul(5));
            }
        },
        // 计算蚂蚁加成
        calculateAntBonus() {
            const drivenAntsBonus = this.antsDriven.add(1);
            const notDrivenAntsPenalty = N(10).div(this.antsNotDriven.add(100).log(10)+8);
            return drivenAntsBonus.pow(notDrivenAntsPenalty).pow(0.5);
        },
        // 更新蚁丘等级
        updateAntHillLevel(level) {
            this.antHillLevel = N(level);
            this.antReleaseSpeed = this.calculateAntReleaseSpeed();
        },
        // 更新蚂蚁数量
        updateAnts(deltaTime) {
            // 计算新产生的未被驱赶的蚂蚁
            const newAnts = this.antReleaseSpeed.mul(deltaTime);
            this.antsNotDriven = this.antsNotDriven.add(newAnts);
            
            // 计算被驱赶的蚂蚁数量
            const cinnamonEffect = this.calculateCinnamonEffect();
            const drivenAnts = this.antsNotDriven.min(cinnamonEffect.mul(deltaTime));
            
            // 更新蚂蚁数量
            this.antsNotDriven = this.antsNotDriven.sub(drivenAnts);
            this.antsDriven = this.antsDriven.add(drivenAnts);
        },

        // 挑战相关方法
        // 检查挑战是否可以完成
        canCompleteChallenge(challengeId) {
            const challenge = this.challenges[challengeId - 1];
            const nextTarget = Decimal.pow(10, challenge.completedTimes.add(1).mul(100000));
            return this.peiCount.gte(nextTarget);
        },
        // 开始挑战
        startChallenge(challengeId) {
            // 先结束所有其他挑战
            this.challenges.forEach(c => c.active = false);
            
            // 开始指定挑战
            const challenge = this.challenges[challengeId - 1];
            challenge.active = true;
            
            // 强制进行太空重置
            this.spaceReset();
        },
        // 结束挑战
        endChallenge(challengeId) {
            const challenge = this.challenges[challengeId - 1];
            challenge.active = false;
        },
        // 完成挑战
        completeChallenge(challengeId) {
            const challenge = this.challenges[challengeId - 1];
            if (!this.canCompleteChallenge(challengeId)) return;
            
            // 增加完成次数
            challenge.completedTimes = challenge.completedTimes.add(1);
            this.totalChallengeCompletions = this.totalChallengeCompletions.add(1);
            
            // 结束挑战
            this.endChallenge(challengeId);
        },
        // 计算挑战加成
        calculateChallengeBonus() {
            return this.totalChallengeCompletions.pow(2).add(1);
        },
        // 检查当前是否有挑战活动
        isChallengeActive() {
            return this.challenges.some(c => c.active);
        },

        //中生代山谷相关方法
        calcLifeBulkCost(index, amount) {
            const pei = this.peiLives[index];
            const r = 1.148698354997035;
            const a1 = pei.baseCost.mul(Decimal.pow(r, pei.level));
            if (amount === 1) return a1.div(this.calcCostMult(index));
            return a1.mul(Decimal.pow(r, amount).sub(1)).div(r - 1).div(this.calcCostMult(index));
        },
        buyPeiLife(index, amount) {
            const cost = this.calcLifeBulkCost(index, amount);
            if (this.fosskie.gte(cost)) {
                this.fosskie = this.fosskie.sub(cost);
                this.peiLives[index].level = this.peiLives[index].level.add(amount);
            }
        },
        buyMaxPeiLife(){
            for(let i=0;i<28;i++) {
                let amount=Math.floor(this.fosskie.mul(this.calcCostMult(i)).div(this.peiLives[i].baseCost).mul(1.148698354997035).max(1).log(1.148698354997035));
                this.peiLives[i].level = this.peiLives[i].level.max(amount);
            }
        },
        startLifeProd(index) {        
            let last =Date.now();
            // 使用非响应式内部进度变量，避免每帧触发 Vue 响应式更新
            let _progress = this.peiLives[index].progress;
            const updateProgress = () => {
                let now = Date.now();
                const delta = (now - last) / 1000;
                const speedMult = this.calcSpeedMult(index);
                _progress += delta * (speedMult.gte(1e100)?1e100:speedMult.toNumber());
                let ovf=speedMult.div(1e100).max(1);
                if (_progress >= this.peiLives[index].duration) {
                    const prod = this.calcLifeProd(index).mul(Math.floor(_progress/this.peiLives[index].duration)).mul(ovf);
                    this.fosskie = this.fosskie.add(prod);
                    this.totalFosskie = this.totalFosskie.add(prod);
                    this.resetFosskie = this.resetFosskie.add(prod);
                    _progress = _progress % this.peiLives[index].duration;
                    // 仅在完成生产周期时才更新响应式 progress（触发 UI 刷新）
                    this.peiLives[index].progress = _progress;
                    cancelAnimationFrame(this.peiLives[index].timer);
                    if(this.peiLives[index].auto) this.startLifeProd(index);
                } else {
                    // 中间帧：只更新非响应式变量，不触发 Vue 更新
                    // 每 50ms 同步一次进度条显示
                    if (now - last > 50 || !this.peiLives[index]._lastSync) {
                        this.peiLives[index].progress = _progress;
                        this.peiLives[index]._lastSync = now;
                    }
                    this.peiLives[index].timer = requestAnimationFrame(updateProgress);
                }
                last = now;
            };
            updateProgress();
        },
        calcLifeProd(index){
            return this.peiLives[index].level.mul(this.peiLives[index].baseProd).mul(this.calcLifeMult(index));
        },
        calcLifeCost(index){
            return Decimal.pow(1.148698354997035,this.peiLives[index].level).mul(this.peiLives[index].baseCost);
        },
        calcLifeMult(index){
            const allLifeMult = Decimal.pow(2, this.traits[39].level)
            .mul(Decimal.pow(2, this.spaceU[0].level))
            .mul(this.salt.div(1000).add(1))
            .mul(this.saltU[0].level.add(1))
            .mul(this.breakCount.gte(250)?this.breakCount.div(100):N(1))
            .mul(this.refineryU[0].level.gte(1)?this.sugarCharge.add(1):1)
            .mul(this.nobreakRecord.gte('1e100000')?this.nutCount.div(1e12).add(1).pow(2):1)
            .mul(Decimal.pow(this.milkLevel.mul(0.002).add(1),this.milk))
            .mul(this.calculateSpiceBonus().max(1));
            if(index==27) return Decimal.pow(1e19, this.peiLives[27].level.div(500).floor())
            .mul(Decimal.pow(2,this.traits[27].level))
            .mul(Decimal.pow(2,this.traits[28].level))
            .mul(Decimal.pow(2,this.traits[29].level))
            .mul(allLifeMult)
            else return Decimal.pow(1e20, this.peiLives[index].level.div(500).floor())
            .mul(Decimal.pow(2, this.traits[index].level))
            .mul(index%3==0?Decimal.pow(2,this.traits[27].level):index%3==1?Decimal.pow(2,this.traits[28].level):Decimal.pow(2,this.traits[29].level))
            .mul(allLifeMult);
        },
        calcSpeedMult(index){
            const allLifeSpeed = (this.breakCount.gte(500)?this.breakCount.div(100):N(1))
            .mul(this.sweetenCount.gte(1)?100:1)
            .mul(Decimal.pow(2, this.traits[40].level));
            if(index==27) return Decimal.pow(2,this.traits[30].level)
            .mul(Decimal.pow(2,this.traits[31].level))
            .mul(Decimal.pow(2,this.traits[32].level))
            .mul(allLifeSpeed);
            else return (index/3%3<1?Decimal.pow(2,this.traits[30].level):index/3%3<2?Decimal.pow(2,this.traits[31].level):Decimal.pow(2,this.traits[32].level))
            .mul(allLifeSpeed);
        },
        calcCostMult(index){
            const allLifeCost = (this.breakCount.gte(750)?this.breakCount.div(100):N(1))
            .mul(this.sweetenCount.gte(5)?100:1)
            .mul(Decimal.pow(2, this.traits[41].level));
            if(index==27) return Decimal.pow(2,this.traits[33].level)
            .mul(Decimal.pow(2,this.traits[34].level))
            .mul(Decimal.pow(2,this.traits[35].level))
            .mul(allLifeCost);
            else return (index/9%3<1?Decimal.pow(2,this.traits[33].level):index/9%3<2?Decimal.pow(2,this.traits[34].level):Decimal.pow(2,this.traits[35].level))
            .mul(allLifeCost);
        },
        unlockLifeAuto(index){
            if (this.fosskie.lt(this.peiLives[index].baseCost.mul(10))) return;
            this.peiLives[index].auto = true;
            this.startLifeProd(index);
            this.fosskie = this.fosskie.sub(this.peiLives[index].baseCost.mul(10));
        },
        buyTrait(index){
            if(this.traits[index].tier == 1 ){
                if(this.icing.lt(this.traits[index].cost)) return;
                this.icing = this.icing.sub(this.traits[index].cost);
            }
            else if(this.traits[index].tier == 2){
                if(this.honey.lt(this.traits[index].cost)) return;
                this.honey = this.honey.sub(this.traits[index].cost);
            }
            else if(this.traits[index].tier == 3){
                if(this.caramel.lt(this.traits[index].cost)) return;
                this.caramel = this.caramel.sub(this.traits[index].cost);
            }
            else return;
            this.traits[index].level = this.traits[index].level.add(1);
            this.traits[index].cost = Decimal.pow(3, this.traits[index].level).sub(1);
        },
        buyMaxTrait1(){
            for(let i=0;i<27;i++) {
                let amount=Math.floor(this.icing.add(1).log(3)+1);
                this.traits[i].level = this.traits[i].level.max(amount);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
        },
        buyMaxTrait2(){
            for(let i=27;i<39;i++) {
                let amount=Math.floor(this.honey.add(1).log(3)+1);
                this.traits[i].level = this.traits[i].level.max(amount);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
        },
        buyMaxTrait3(){
            for(let i=39;i<42;i++) {
                let amount=Math.floor(this.caramel.add(1).log(3)+1);
                this.traits[i].level = this.traits[i].level.max(amount);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
        },
        icingReset() {
            if (this.totalFosskie.lt(1e12)) return;
            this.icing = this.icing.add(this.icingGain);
            this.totalIcing = this.totalIcing.add(this.icingGain);
            this.fosskie = N(0);
            this.resetFosskie = N(0);
            this.peiLives.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<27;i++) {
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;
            }
        },
        honeyReset() {
            if (this.totalFosskie.lt(1e48)) return;
            this.honey = this.honey.add(this.honeyGain);
            this.totalHoney = this.totalHoney.add(this.honeyGain);
            this.icing = N(0);
            this.totalIcing = N(0);
            this.fosskie = N(0);
            this.resetFosskie = N(0);
            this.peiLives.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<27;i++) {
                this.traits[i].level = N(0);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;}
        },
        sweetenReset(){
            if (this.totalFosskie.lt(1e192)) return;
            this.sweetenCount = this.sweetenCount.add(1);
            this.honey = N(0);
            this.totalHoney = N(0);
            this.icing = N(0);
            this.totalIcing = N(0);
            this.fosskie = N(0);
            this.resetFosskie = N(0);
            this.peiLives.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<27;i++) {
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;
            }
            for(let i=0;i<39;i++) {
                this.traits[i].level = N(0);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
        },
        caramelReset(){
            if (this.totalFosskie.lt(1e308)) return;
            this.caramel = this.caramel.add(this.caramelGain);
            this.totalCaramel = this.totalCaramel.add(this.caramelGain);
            this.honey = N(0);
            this.totalHoney = N(0);
            this.icing = N(0);
            this.totalIcing = N(0);
            this.fosskie = N(0);
            this.resetFosskie = N(0);
            this.peiLives.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<27;i++) {
                if(!this.automation[10].activate) cancelAnimationFrame(this.peiLives[i].timer);
                this.peiLives[i].progress = 0;
            }
            for(let i=0;i<39;i++) {
                this.traits[i].level = N(0);
                this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            }
        },
        buyRefineryU(index){
            const upgrade=this.refineryU[index];
            if(this.caramel.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)) return;
            this.caramel = this.caramel.sub(upgrade.cost);
            this.refineryU[index].level = this.refineryU[index].level.add(1);
            let t=[1,1e6,1e12,1e18,1e24]
            this.refineryU[index].cost = Decimal.pow(1.148698354997035, upgrade.level).mul(t[index]);
        },
        buyMaxRefineryU(index){
            for(let i=0;i<100;i++) this.buyRefineryU(index);
        },
        buyAllRefineryU(){
            for(let i=0;i<5;i++) this.buyMaxRefineryU(i);
        },
        buyCondenseryU(id){
            const upgrade = this.condenseryU[id-1];
            if(this.caramel.lt(upgrade.cost) || upgrade.level.gte(upgrade.maxLevel)) return;
            this.caramel = this.caramel.sub(upgrade.cost);
            this.condenseryU[id-1].level = this.condenseryU[id-1].level.add(1);
            let t=[1,1e6,1e12,1e18,1e24];
            this.condenseryU[id-1].cost = Decimal.pow(1.148698354997035, upgrade.level).mul(t[id-1]);
        },
        calcCondenseryMult(id){
            const level = this.condenseryU[id-1].level;
            if(id===1) return level.gte(1) ? this.totalButter : N(0);
            if(id===2) return Decimal.pow(1.096, level);
            if(id===3) return Decimal.pow(1.072, level);
            if(id===4) return Decimal.pow(1.047, level);
            if(id===5) return Decimal.pow(1.023, level);
            return N(1);
        },
        calcMilkChargeSpeed(){
            let speed = N(0);
            if(this.condenseryU[0].level.gte(1)) speed = this.totalButter;
            speed = speed.mul(this.calcCondenseryMult(2)).mul(this.calcCondenseryMult(3)).mul(this.calcCondenseryMult(4)).mul(this.calcCondenseryMult(5));
            let constellBonus = N(1);
            for(const c of this.constellationUpgrades){
                if(c.active) constellBonus = constellBonus.mul(1 + (Math.floor((c.id-1)/3) * 0.05 + 0.1));
            }
            speed = speed.mul(constellBonus);
            return speed;
        },
        constellationFragmentCost(){
            return Decimal.pow(10, N(1000000).mul(this.totalConstellationFragments.add(1)));
        },
        canGainConstellationFragment(){
            return this.totalLifetimePei.gte(this.constellationFragmentCost());
        },
        gainConstellationFragment(){
            if(!this.canGainConstellationFragment()) return;
            this.constellationFragments = this.constellationFragments.add(1);
            this.totalConstellationFragments = this.totalConstellationFragments.add(1);
        },
        activateConstellation(id){
            const c = this.constellationUpgrades[id-1];
            if(c.active || this.constellationFragments.lt(c.cost)) return;
            this.constellationFragments = this.constellationFragments.sub(c.cost);
            c.active = true;
        },
        deactivateConstellation(id){
            const c = this.constellationUpgrades[id-1];
            if(!c.active) return;
            this.constellationFragments = this.constellationFragments.add(c.cost);
            c.active = false;
        },
        deactivateAllConstellations(){
            for(const c of this.constellationUpgrades){
                if(c.active) this.deactivateConstellation(c.id);
            }
        },
        calcConstellationBonus(){
            let bonus = N(1);
            for(const c of this.constellationUpgrades){
                if(c.active) bonus = bonus.mul(1 + (Math.floor((c.id-1)/3) * 0.05 + 0.1));
            }
            return bonus;
        },
        calcMagicProduction(){
            let prod = N(1);
            prod = prod.mul(Decimal.pow(2, this.magicUpgrades[0]));
            return prod;
        },
        calcMagicCap(){
            let cap = N(100);
            cap = cap.mul(Decimal.pow(2, this.magicUpgrades[1]));
            return cap;
        },
        calcMagicSkillDuration(id){
            let dur = 60;
            dur *= Math.pow(1.25, this.magicUpgrades[2].toNumber());
            return dur;
        },
        calcMagicSkillEffect(id){
            let eff = N(2);
            eff = eff.mul(Decimal.pow(1.25, this.magicUpgrades[3]));
            if(id === 4) eff = eff.mul(Decimal.pow(1.25, this.magicUpgrades[3]));
            return eff;
        },
        upgradeMagic(id){
            this.magicUpgrades[id-1] = this.magicUpgrades[id-1].add(1);
        },
        activateMagicSkill(id){
            const skill = this.magicSkills[id-1];
            if(skill.active || this.magicAmount.lt(skill.cost)) return;
            this.magicAmount = this.magicAmount.sub(skill.cost);
            skill.active = true;
            skill.timer = this.calcMagicSkillDuration(id);
        },

        //超越相关方法
        calcCeleBulkCost(index, amount) {
            const pei = this.peiCeles[index];
            const r = 1.148698354997035;
            const a1 = pei.baseCost.mul(Decimal.pow(r, pei.level));
            if (amount === 1) return a1.div(this.calcCeleCostMult(index));
            return a1.mul(Decimal.pow(r, amount).sub(1)).div(r - 1).div(this.calcCeleCostMult(index));
        },
        buyPeiCele(index, amount) {
            const cost = this.calcCeleBulkCost(index, amount);
            if (this.starkie.gte(cost)) {
                this.starkie = this.starkie.sub(cost);
                this.peiCeles[index].level = this.peiCeles[index].level.add(amount);
                if(this.peiCeles[index].timer == null) this.startCeleProd(index);
            }
        },
        buyMaxPeiCele(){
            for(let i=0;i<56;i++) {
                let amount=Math.floor(this.starkie.mul(this.calcCeleCostMult(i)).div(this.peiCeles[i].baseCost).mul(1.148698354997035).max(1).log(1.148698354997035));
                this.peiCeles[i].level = this.peiCeles[i].level.max(amount);
                if(this.peiCeles[i].level.gt(0) && !this.peiCeles[i].timer) this.startCeleProd(i);
            }
        },
        startCeleProd(index) {        
            let last =Date.now();
            let _progress = this.peiCeles[index].progress;
            const updateProgress = () => {
                let now = Date.now();
                const delta = (now - last) / 1000;
                const speedMult = this.calcCeleSpeedMult(index);
                _progress += delta * (speedMult.gte(1e100)?1e100:speedMult.toNumber());
                let ovf=speedMult.div(1e100).max(1);
                if (_progress >= this.peiCeles[index].duration) {
                    const prod = this.calcCeleProd(index).mul(Math.floor(_progress/this.peiCeles[index].duration)).mul(ovf);
                    this.starkie = this.starkie.add(prod);
                    this.totalStarkie = this.totalStarkie.add(prod);
                    this.resetStarkie = this.resetStarkie.add(prod);
                    this.milkExp = this.milkExp.add(this.calcCeleProd(index));
                    if(this.milkExp.gte(this.milkExpReq)){
                        this.milkLevel = this.milkLevel.add(1);
                        this.milk=this.milkCount;
                    }
                    _progress = _progress % this.peiCeles[index].duration;
                    this.peiCeles[index].progress = _progress;
                    cancelAnimationFrame(this.peiCeles[index].timer);
                    this.startCeleProd(index);
                } else {
                    if (now - last > 50 || !this.peiCeles[index]._lastSync) {
                        this.peiCeles[index].progress = _progress;
                        this.peiCeles[index]._lastSync = now;
                    }
                    this.peiCeles[index].timer = requestAnimationFrame(updateProgress);
                }
                last = now;
            };
            updateProgress();
        },
        calcCeleProd(index){
            return this.peiCeles[index].level.mul(this.peiCeles[index].baseProd).mul(this.calcCeleMult(index));
        },
        calcCeleCost(index){
            return Decimal.pow(1.148698354997035,this.peiCeles[index].level).mul(this.peiCeles[index].baseCost);
        },
        calcCeleMult(index){
            return (this.peiCeles[index].level.lte(200)?Decimal.pow(3, this.peiCeles[index].level.div(25).floor()):Decimal.pow(3, this.peiCeles[index].level.add(200).div(50).floor()))
            .mul(Decimal.pow(2, this.enhans[index % 14].level))
            .mul(Decimal.pow(2, this.enhans[30].level))
            .mul(this.refineryU[3].level.gte(1)?this.sweetenCount.mul(0.1).add(1):1)
            .mul(this.calculateSpiceBonus().max(1));
        },
        calcCeleSpeedMult(index){
            return Decimal.pow(2, this.enhans[this.celetype[index]+15].level)
            .mul(Decimal.pow(2, this.enhans[31].level))
            .mul(this.dreamCount.gte(5)?10:1);
        },
        calcCeleCostMult(index){
            let researchIndex = Math.floor(index / 4);
            if(researchIndex < 14){
                return Decimal.pow(2, this.astroResearch[researchIndex].level)
                .mul(Decimal.pow(2, this.enhans[32].level))
                .mul(this.dreamCount.gte(7)?10:1);
            }
            return N(1);
        },
        buyEnhan(index){
            if(this.enhans[index].tier == 1 ){
                if(this.cheese.lt(this.enhans[index].cost)) return;
                this.cheese = this.cheese.sub(this.enhans[index].cost);
            }
            else if(this.enhans[index].tier == 2){
                if(this.cream.lt(this.enhans[index].cost)) return;
                this.cream = this.cream.sub(this.enhans[index].cost);
            }
            else if(this.enhans[index].tier == 3){
                if(this.butter.lt(this.enhans[index].cost)) return;
                this.butter = this.butter.sub(this.enhans[index].cost);
            }
            else return;
            this.enhans[index].level = this.enhans[index].level.add(1);
            this.enhans[index].cost = Decimal.pow(5, this.enhans[index].level).sub(1);
        },
        buyMaxEnhan1(){
            for(let i=0;i<15;i++) {
                let amount=Math.floor(this.cheese.add(1).log(5)+1);
                this.enhans[i].level = this.enhans[i].level.max(amount);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level).sub(1);
            }
        },
        buyMaxEnhan2(){
            for(let i=15;i<30;i++) {
                let amount=Math.floor(this.cream.add(1).log(5)+1);
                this.enhans[i].level = this.enhans[i].level.max(amount);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level).sub(1);
            }
        },
        buyMaxEnhan3(){
            for(let i=30;i<40;i++) {
                let amount=Math.floor(this.butter.add(1).log(5)+1);
                this.enhans[i].level = this.enhans[i].level.max(amount);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level).sub(1);
            }
        },
        cheeseReset() {
            if (this.totalStarkie.lt(1e12)) return;
            this.cheese = this.cheese.add(this.cheeseGain);
            this.totalCheese = this.totalCheese.add(this.cheeseGain);
            this.starkie = N(0);
            this.resetStarkie = N(0);
            this.peiCeles.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<56;i++) {
                cancelAnimationFrame(this.peiCeles[i].timer);
                this.peiCeles[i].timer=null;
                this.peiCeles[i].progress = 0;
            }
        },
        creamReset() {
            if (this.totalStarkie.lt(1e48)) return;
            this.cream = this.cream.add(this.creamGain);
            this.totalCream = this.totalCream.add(this.creamGain);
            this.cheese = N(0);
            this.totalCheese = N(0);
            this.starkie = N(0);
            this.resetStarkie = N(0);
            this.peiCeles.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<56;i++) {
                cancelAnimationFrame(this.peiCeles[i].timer);
                this.peiCeles[i].timer=null;
                this.peiCeles[i].progress = 0;
            }
            for(let i=0;i<15;i++) {
                this.enhans[i].level = N(0);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level);
            }
        },
        dreamReset(){
            if (this.totalStarkie.lt(1e192)) return;
            this.dreamCount = this.dreamCount.add(1);
            this.cream = N(0);
            this.totalCream = N(0);
            this.butter = N(0);
            this.totalButter = N(0);
            this.starkie = N(0);
            this.resetStarkie = N(0);
            this.peiCeles.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<56;i++) {
                cancelAnimationFrame(this.peiCeles[i].timer);
                this.peiCeles[i].timer=null;
                this.peiCeles[i].progress = 0;
            }
            for(let i=0;i<30;i++) {
                this.enhans[i].level = N(0);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level);
            }
        },
        butterReset(){
            if (this.totalStarkie.lt(1e308)) return;
            this.butter = this.butter.add(this.butterGain);
            this.totalButter = this.totalButter.add(this.butterGain);
            this.cream = N(0);
            this.totalCream = N(0);
            this.butter = N(0);
            this.totalButter = N(0);
            this.starkie = N(0);
            this.resetStarkie = N(0);
            this.peiCeles.forEach(pei => {
                pei.level = N(0);
            });
            for(let i=0;i<56;i++) {
                cancelAnimationFrame(this.peiCeles[i].timer);
                this.peiCeles[i].timer=null;
                this.peiCeles[i].progress = 0;
            }
            for(let i=0;i<30;i++) {
                this.enhans[i].level = N(0);
                this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level);
            }
        },
        buyCondenseryU(index){
            const upgrade=this.refineryU[index];
            if(this.caramel.lt(upgrade.cost) | upgrade.level.gte(upgrade.maxLevel)) return;
            this.caramel = this.caramel.sub(upgrade.cost);
            this.refineryU[index].level = this.refineryU[index].level.add(1);
            let t=[1,1e6,1e12,1e18,1e24]
            this.refineryU[index].cost = Decimal.pow(1.148698354997035, upgrade.level).mul(t[index]);
        },
        buyMaxCondenseryU(index){
            for(let i=0;i<100;i++) this.buyCondenseryU(index);
        },
        calcResearchDuration(index){
            return N(100).mul(Decimal.pow(3, this.astroResearch[index].level));
        },
        calcResearchSpeedMult(){
            let speed = this.dreamCount.gte(1) ? this.dreamCount : N(1);
            if(this.dreamCount.gte(40)){
                speed = speed.mul(Decimal.pow(1.25, this.dreamCount.sub(40).add(1)));
            }
            return speed;
        },
        startAstroResearch(index){
            for(let i=0;i<20;i++){
                if(this.astroResearch[i].active && i !== index){
                    return;
                }
            }
            if(this.astroResearch[index].active) return;
            
            this.astroResearch[index].active = true;
            this.astroResearch[index].duration = this.calcResearchDuration(index);
            
            let last = Date.now();
            let _progress = this.astroResearch[index].progress;
            const updateProgress = () => {
                let now = Date.now();
                const delta = (now - last) / 1000;
                _progress += delta * this.calcResearchSpeedMult().toNumber();
                
                if(_progress >= this.astroResearch[index].duration){
                    this.astroResearch[index].level = this.astroResearch[index].level.add(1);
                    _progress = 0;
                    this.astroResearch[index].progress = 0;
                    this.astroResearch[index].duration = this.calcResearchDuration(index);
                    cancelAnimationFrame(this.astroResearch[index].timer);
                    this.startAstroResearch(index);
                } else {
                    // 每 100ms 同步一次进度条到 Vue 响应式系统
                    if (!this.astroResearch[index]._lastSync || now - this.astroResearch[index]._lastSync > 100) {
                        this.astroResearch[index].progress = _progress;
                        this.astroResearch[index]._lastSync = now;
                    }
                    this.astroResearch[index].timer = requestAnimationFrame(updateProgress);
                }
                last = now;
            };
            updateProgress();
        },
        cancelAstroResearch(index){
            if(this.astroResearch[index].timer){
                cancelAnimationFrame(this.astroResearch[index].timer);
                this.astroResearch[index].timer = null;
            }
            this.astroResearch[index].active = false;
            this.astroResearch[index].progress = 0;
        },

        // 性能优化：构建 upgrades 按 buildingId 的索引缓存
        _rebuildUpgradeIndex() {
            this._upgByBuilding = {};
            this.upgrades.forEach(u => {
                if (!this._upgByBuilding[u.buildingId]) this._upgByBuilding[u.buildingId] = [];
                this._upgByBuilding[u.buildingId].push(u);
            });
        },
        // 快速获取指定 buildingId 的 upgrades（替代 this.upgrades.filter）
        _getUpgradesByBuilding(buildingId) {
            return this._upgByBuilding[buildingId] || [];
        },

        //探索中心相关方法
        buyExploreArea(index) {
            let area = this.exploreArea[index];
            let amount = parseInt(this.exploreBulkAmount);
            let totalCost = this.calcExploreBulkCost(index);
            if (this.datakie.lt(totalCost)) return;
            this.datakie = this.datakie.sub(totalCost);
            area.quantity = area.quantity.add(amount);
            area.cost = area.baseCost.mul(Decimal.pow(1.148698354997035, area.quantity));
            this.eggs = this.eggs.add(amount);
            this.checkExploreAchievements();
        },
        calcExploreBulkCost(index) {
            let area = this.exploreArea[index];
            let r = 1.148698354997035;
            let n = parseInt(this.exploreBulkAmount);
            let a1 = area.cost;
            if (n == 1) return a1;
            return Decimal.pow(r, n).sub(1).mul(a1).div(r - 1);
        },
        checkExploreAchievements() {
            for (let a = 0; a < 14; a++) {
                for (let n = 1; n <= 10; n++) {
                    let idx = (n - 1) * 14 + a;
                    if (!this.exploreAchievements[idx].unlocked && this.exploreArea[a].quantity.gte(n * 100)) {
                        this.exploreAchievements[idx].unlocked = true;
                        this.flour = this.flour.add(1);
                    }
                }
            }
            for (let i = 1; i <= 10; i++) {
                let idx = 140 + (i - 1);
                if (!this.exploreAchievements[idx].unlocked && this.datakie.gte(N(10).pow(i * 10 + 12))) {
                    this.exploreAchievements[idx].unlocked = true;
                    this.flour = this.flour.add(1);
                }
            }
        },
        unlockAdvAuto(id) {
            let auto = this.advancedAutomation.find(a => a.id === id);
            if (!auto || this.chickens.lt(auto.cost)) return;
            this.chickens = this.chickens.sub(auto.cost);
            auto.unlocked = true;
        },
        toggleAdvAuto(id) {
            let auto = this.advancedAutomation.find(a => a.id === id);
            if (!auto || !auto.unlocked) return;
            auto.activate = !auto.activate;
        },
        matchaReset() {
            if (this.datakie.lt(1e12)) return;
            let gain = this.matchaGain;
            this.matcha = this.matcha.add(gain);
            this.totalMatcha = this.totalMatcha.add(gain);
            this.matchaResetCount = this.matchaResetCount.add(1);
            this.resetMatchaLayer();
        },
        resetMatchaLayer() {
            this.datakie = N(0);
            this.totalDatakie = N(0);
            this.exploreArea.forEach(area => {
                area.quantity = N(0);
                area.cost = N(area.baseCost);
            });
            this.exploreUpgrades.forEach(u => {
                u.level = N(0);
            });
        },
        coffeeReset() {
            if (this.datakie.lt(1e48)) return;
            let gain = this.coffeeGain;
            this.coffee = this.coffee.add(gain);
            this.totalCoffee = this.totalCoffee.add(gain);
            this.coffeeResetCount = this.coffeeResetCount.add(1);
            this.datakie = N(0);
            this.totalDatakie = N(0);
            this.exploreArea.forEach(area => {
                area.quantity = N(0);
                area.cost = N(area.baseCost);
            });
            this.exploreUpgrades.forEach(u => {
                u.level = N(0);
            });
            this.matcha = N(0);
            this.totalMatcha = N(0);
        },
        buyExploreUpgrade(id) {
            let upg = this.exploreUpgrades.find(u => u.id === id);
            if (!upg || this.datakie.lt(upg.cost) || upg.level.gte(upg.maxLevel)) return;
            this.datakie = this.datakie.sub(upg.cost);
            upg.level = upg.level.add(1);
            upg.cost = N(10).pow((id - 1) * 3 + 10).mul(Decimal.pow(10, upg.level));
            this.eggs = this.eggs.add(5);
        },
        terminalReset() {
            if (this.datakie.lt(818268448)) return;
            let gain = this.gelatinGain;
            this.gelatin = this.gelatin.add(gain);
            this.endCount = this.endCount.add(1);
            this.chickens = this.chickens.add(this.eggs);
            this.eggs = N(0);
            this.datakie = N(0);
            this.totalDatakie = N(0);
            this.exploreArea.forEach(area => {
                area.quantity = N(0);
                area.cost = N(area.baseCost);
            });
            this.exploreUpgrades.forEach(u => {
                u.level = N(0);
            });
            this.exploreAchievements.forEach(a => {
                a.unlocked = false;
            });
            this.flour = N(0);
        },
        buyTerminalUpgrade(id) {
            let upg = this.terminalUpgrades.find(u => u.id === id);
            if (!upg || this.gelatin.lt(upg.cost) || upg.level.gte(upg.maxLevel)) return;
            this.gelatin = this.gelatin.sub(upg.cost);
            upg.level = upg.level.add(1);
            upg.cost = N(10).pow((id - 1) * 5 + 20).mul(Decimal.pow(10, upg.level));
        },
        //杂项
        format(decimal) {
            // 快速路径：小数字直接返回，避免不必要的 Decimal 运算
            if (decimal.lt(1000)) {
                if (decimal.lt(10)) return decimal.toFixed(3);
                if (decimal.lt(100)) return decimal.toFixed(2);
                return decimal.toFixed(1);
            }
            let e = decimal.exponent.toFixed(0);
            let m = decimal.mantissa.toFixed(3);
            if(m == "10.000") m = "9.999";
            if (decimal.lt(1e12)) return this.comma(decimal);
            if (decimal.lt("1e1000000000000")) return m + "e" + this.comma(e);
            let ee = Math.floor(Math.log10(decimal.exponent)).toFixed(0);
            let mm = (decimal.exponent / Math.pow(10, ee)).toFixed(3);
            if (mm == "10.000") mm = "9.999";
            if (decimal.lt("1e9000000000000000")) return m + "e" + mm + "e" + ee;
            else return "END"
        },
        formatInt(decimal) {
            let e = decimal.exponent.toFixed(0);
            let m = decimal.mantissa.toFixed(3);
            let ee = Math.floor(Math.log10(decimal.exponent)).toFixed(0);
            let mm = (decimal.exponent / Math.pow(10, ee)).toFixed(3);
            if (m == "10.000") m = "9.999";
            if (mm == "10.000") mm = "9.999";
            if (decimal.lt(1e12)) return this.comma(decimal);
            else if (decimal.lt("1e1000000000000")) return m + "e" + this.comma(e);
            else if (decimal.lt("1e9000000000000000")) return m + "e" + mm + "e" + ee;
            else return "END"
        },
        comma(num) {
            if (num === null || num === undefined) return "END"
            let init = num.toString()
            let portions = init.split(".")
            portions[0] = portions[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            return portions[0]
        },
        saveData() {
            const result = {};
            for (const name of SAVE_SCHEMA.simple) result[name] = this[name];
            for (const name of SAVE_SCHEMA.booleanTrue) result[name] = this[name];
            for (const name of SAVE_SCHEMA.number) result[name] = this[name];
            for (const [dataName, saveKey, prop] of SAVE_SCHEMA.arrayProps) {
                result[saveKey] = this[dataName].map(item => item[prop]);
            }
            for (const [dataName, saveKey, prop] of SAVE_SCHEMA.arrayExtraProps) {
                result[saveKey] = this[dataName].map(item => item[prop]);
            }
            for (const [name, props] of SAVE_SCHEMA.idMatched) {
                result[name] = this[name].map(item => {
                    const obj = {};
                    for (const p of props) obj[p] = item[p];
                    return obj;
                });
            }
            result.lastUpdateTime = Date.now();
            result.magicUpgrades = this.magicUpgrades;
            return result;
        },
        loadData(save){
            for (const name of SAVE_SCHEMA.simple) this[name] = save[name] || N(0);
            for (const name of SAVE_SCHEMA.booleanTrue) this[name] = save[name] || true;
            for (const name of SAVE_SCHEMA.number) this[name] = save[name] || 0;
            const arrayDefault = (prop) => (prop === 'unlocked' || prop === 'activate' || prop === 'auto') ? false : N(0);
            for (const [dataName, saveKey, prop] of SAVE_SCHEMA.arrayProps) {
                const def = arrayDefault(prop);
                this[dataName].forEach((item, index) => {
                    item[prop] = !save[saveKey] ? def : save[saveKey][index] || def;
                });
            }
            for (const [dataName, saveKey, prop] of SAVE_SCHEMA.arrayExtraProps) {
                const def = arrayDefault(prop);
                this[dataName].forEach((item, index) => {
                    item[prop] = !save[saveKey] ? def : save[saveKey][index] || def;
                });
            }
            for (const [name, props] of SAVE_SCHEMA.idMatched) {
                if (save[name]) {
                    save[name].forEach(savedItem => {
                        const item = this[name].find(i => i.id === savedItem.id);
                        if (item) {
                            for (const p of props) {
                                if (p !== 'id') item[p] = savedItem[p] || N(0);
                            }
                        }
                    });
                }
            }
            this.antReleaseSpeed = this.calculateAntReleaseSpeed();
            if (save.magicUpgrades) {
                this.magicUpgrades = save.magicUpgrades.map(v => v || N(0));
            }
            this.updateCost();
            this.handleOfflineProduction(save.lastUpdateTime);
        },
        saveGame() {
            console.log(this.saveData());
            // 2. 转换为JSON字符串
            const save= formatsave.encode(this.saveData())
            console.log(save);
            // 3. 显示给用户（示例）
            navigator.clipboard.writeText(save);
            alert("存档代码已复制到剪贴板");
        },
        loadGame() {
            const save = prompt("请输入存档代码");
                // 4. 解析JSON
            const data = formatsave.decode(save);
            transformToDecimal(data);
                // 5. 应用存档数据
            this.loadData(data);
            alert("存档加载成功！");
            this.localSave();
        },
        localSave() {
            localStorage.pelkieClickerSave = formatsave.encode(this.saveData());
        },
        localLoad() {
            if (!localStorage.pelkieClickerSave) return;
            const data = formatsave.decode(localStorage.pelkieClickerSave);
            transformToDecimal(data);
            console.log(data);
            this.loadData(data);
        },
        hardReset() {
            if (confirm("是否硬重置?这将重置你的所有进度!")) {
                const defaults = getDefaultData();
                for (const key in defaults) {
                    this[key] = defaults[key];
                }
                this.localSave();
                this.currentArea = 1;
            }
        },
        handleOfflineProduction(savedTime) {
            if (!savedTime) return;

            const currentTime = Date.now();
            const offlineTime = Math.min(currentTime - savedTime, this.ascendU[3].level.toNumber() * 21600000 + 21600000);
            const offlineSeconds = offlineTime / 1000;

            if (offlineSeconds > 1) {
                // 计算离线收益
                const production = this.totalProduction.mul(offlineSeconds*0.8);
                this.peiCount = this.peiCount.add(production);
                this.thisAscendPei = this.thisAscendPei.add(production);
                this.totalLifetimePei = this.totalLifetimePei.add(production);
                const fosskieproduction = this.fosskiePerSecond.mul(offlineSeconds*0.8);
                this.fosskie = this.fosskie.add(fosskieproduction);
                this.totalFosskie = this.totalFosskie.add(fosskieproduction);
                this.resetFosskie = this.resetFosskie.add(fosskieproduction);
                const starkieproduction = this.starkiePerSecond.mul(offlineSeconds*0.8);
                this.starkie = this.starkie.add(starkieproduction);
                this.totalStarkie = this.totalStarkie.add(starkieproduction);
                this.resetStarkie = this.resetStarkie.add(starkieproduction);
                this.sugar = this.sugar.add(this.sugarGain.mul(Math.floor(offlineSeconds/this.sugarTimeCap)));
                this.salt = this.salt.add(this.saltGain.mul(Math.floor(offlineSeconds/this.saltTimeCap)));
                this.playTime = this.playTime + (offlineSeconds % this.sugarTimeCap);
                this.playTime2 = this.playTime2 + (offlineSeconds % this.saltTimeCap);
                this.totalPlayTime = this.totalPlayTime + offlineSeconds;
                // 显示离线通知
                this.showOfflineNotification(offlineSeconds, production, fosskieproduction, starkieproduction);
            }
        },
        showOfflineNotification(seconds, a, b, c) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            const toast = document.createElement('div');
            toast.className = 'offline-toast';
            toast.innerHTML = `
        <p>你离线了 ${hours}h${mins}m${secs}s</p>
        <p>离线效率: 80%, 时长上限: ${this.ascendU[3].level.toNumber()*6+6}h</p>
        <p>获得了 ${this.formatInt(this.sugarGain.mul(Math.floor(seconds/this.sugarTimeCap)))} 糖块</p>
        <p>获得 ${this.format(a)} 佩干</p>`
        + (this.hypercendU[2].level.gt(0)? `<p>获得了 ${this.format(b)} 化石饼干</p>`:``)
        + (this.refineryU[2].level.gt(0)? `<p>获得了 ${this.format(c)} 星尘饼干</p>`:``);
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        },
        updateCost(){
            //佩干区域 - 缓存常量避免重复创建 Decimal 实例
            const priceRate = markRaw(new Decimal(1.148698354997035));
            for(let i=0;i<42;i++) this.buildings[i].cost = this.buildings[i].baseCost.mul(priceRate.pow(this.buildings[i].quantity));
            let a0=[1,3,5,7,50,77,100,777,999,9000,99999,222222,399999,1.5e7,1e8,2e8,1e9,1.92e9,9e9,1e10];
            let p=[0,1334,10,0,0,0,100,0,0,0,0,2e6,0,0,0,2e8,0,0,0,0];
            let q=[1,1,1,7,100,10,100,10,100,1e9,2,1,1,1,4,1000,10,1,1000,1];
            for(let i=0;i<20;i++){
                this.ascendU[i].cost = i==19?this.ascendU[19].level.add(3).pow(7).mul(1.5e7):N(a0[i]).add(this.ascendU[i].level.mul(p[i])).mul(Decimal.pow(q[i],this.ascendU[i].level))
            }
            let r=[1,1,1,1,1,1,1,1,1,1,1,1,10,100,1000,10000,1e5,1e5,1e6,1e6];
            let s=[2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,4,4,10,1e6]
            for(let i=0;i<20;i++){
                this.transcendU[i].cost=Decimal.pow(s[i],this.transcendU[i].level).mul(r[i]);
            }
            let t=[1,1e6,1e12,1e18,1e24,1e100]
            for(let i=0;i<6;i++) this.hypercendU[i].cost=Decimal.pow(1.148698354997035,this.hypercendU[i].level).mul(t[i]);
            //中生代山谷区域
            for(let i=0;i<27;i++) if(this.peiLives[i].auto & this.peiLives[i].level.gte(1)) this.startLifeProd(i);
            for(let i=0;i<42;i++) this.traits[i].cost = Decimal.pow(3, this.traits[i].level).sub(1);
            let u=[1,1e6,1e12,1e18,1e24]
            for(let i=0;i<5;i++) this.refineryU[i].cost = Decimal.pow(1.148698354997035, this.refineryU[i].level).mul(u[i]);
            //超越区域
            for(let i=0;i<56;i++) if(this.peiCeles[i].level.gte(1)) this.startCeleProd(i);
            for(let i=0;i<40;i++) this.enhans[i].cost = Decimal.pow(5, this.enhans[i].level).sub(1);
            let v=[1,1e6,1e12,1e18,1e24]
            for(let i=0;i<5;i++) this.condenseryU[i].cost = Decimal.pow(1.148698354997035, this.condenseryU[i].level).mul(v[i]);
            
            this.milk=this.milkCount;
        },
        // 其他方法...
    },
    computed: {
        // 带升级加成的总生产量
        sugarBonus(){
            return this._getUpgradesByBuilding(110).reduce((prod, upgrade, i) => {
                let factor = N(milkUpgradeBase[upgrade.id-1]*0.001);
                return upgrade.unlocked ? prod.mul(factor.mul(this.sugar.min(1000)).mul(this.sugarUpgradeMult).add(1)) : prod;
            }, N(1))
            .mul([1,2,3,4,5,6,7,8,9,10].reduce((prod,i)=>{
                return this.ascendU[15].level.gte(i)?prod.mul(this.sugar.min(1000).mul(0.001*i).mul(this.sugarUpgradeMult).add(1)):prod;
            },N(1)))
        },
        sugarUpgradeMult(){
            return this.transcendU[8].level.mul(0.1).add(1)
            .mul(this.totalFosskie.div(65536).add(1).pow(0.25))
            .mul(this.traits[38].level.mul(0.2).add(1));
        },
        milkBonus(){
            return this._getUpgradesByBuilding(102).reduce((prod, upgrade, i) => {
                let factor = N(milkUpgradeBase[upgrade.id-1]*0.001);
                return upgrade.unlocked ? prod.mul(factor.mul(this.milk).mul(this.milkUpgradeMult).add(1)) : prod;
            }, N(1))
            .mul([1,2,3,4,5,6,7,8,9,10].reduce((prod,i)=>{
                return this.ascendU[9].level.gte(i)?prod.mul(this.milk.mul(0.001*i).mul(this.milkUpgradeMult).add(1)):prod;
            },N(1)))
        },
        milkUpgradeMult(){
            return this.transcendU[9].level.mul(0.1).add(1)
            .mul(this.totalStarkie.add(1).pow(0.25));
        },
        upgradeBonus(){
            return this._getUpgradesByBuilding(105).reduce((sum, upgrade) => {
                return upgrade.unlocked ? sum.mul(1+Math.floor((upgrade.id+9)/10)/100) : sum;
            }, N(1))
            .mul(this._getUpgradesByBuilding(104).filter(u => u.id>=6).reduce((sum, upgrade, i) => {
                let factor=[1.01,1.1,2,11,101]
                return upgrade.unlocked ? sum.mul(factor[i]) : sum;
            }, N(1)))
            .mul(this._getUpgradesByBuilding(106).reduce((sum, upgrade) => {
                return upgrade.unlocked ? sum.mul(1.1) : sum;
            }, N(1)))
            .mul(this._getUpgradesByBuilding(107).find(u => u.id == 4).unlocked?Math.pow(1.01,Math.max(50-this.totalRealityShards.toNumber()/20,0)):1)
            .mul(Decimal.pow(1.1,this.ascendU[1].level))
            .mul(Decimal.pow(1.1+(this.breakCount.max(5).min(8).sub(4).mul(0.0223).toNumber()),this.transcendU[0].level))
            .mul(Decimal.pow(65536,this.spaceU[1].level))
            .mul(this.enableGolden&!this.transcendU[13].level.gte(1)?1:this.ascendU[8].level.add(this.transcendU[4].level).mul(0.1).add(1.4))
            .mul(this.enableClick&!this.transcendU[13].level.gte(1)?1:this.ascendU[16].level.add(this.transcendU[4].level).mul(0.1).add(1.4))
            .mul(Decimal.pow(this.milkLevel.mul(0.01).add(1),this.milk))
            .mul(this.nobreakRecord.gte('1e100000')?this.nutCount.div(1e12).add(1).pow(2):1)
            .mul(this.calculateSpiceBonus().max(1));
        },
        ascendBonus(){
            return this._getUpgradesByBuilding(104).filter(u => u.id<=5).reduce((sum, upgrade, i) => {
                let factor=[0.05,0.2,0.25,0.25,0.25]
                return upgrade.unlocked ? sum.add(this.totalRealityShards.mul(factor[i])) : sum;
            }, N(1));
        },
        transcendBonus(){
            return this.transcensionCount.gte(1)?this.totalTranscendPoints.add(2):N(1);
        },
        breakBonus(){
            return Decimal.pow(this.breakCount.gte(8)?10:4, this.breakCount);
        },
        hypercendBonus(){
            return this.hyperEffect(0)
            .mul(this.breakCount.gte(16)?this.totalHypercendPoints.add(4):1);
        },
        buildingCostMult(){
            return (this.hypercendU[3].level.gte(1)?N(0.5).div(this.transcendU[5].level.mul(0.1).add(1)):this.goldenPeiEffects.buildingCostReduction)
            .mul(this.ascendU[10].level.mul(-0.02).add(1))
            .mul(Decimal.pow(0.99,this.transcendU[2].level));
        },
        upgradeCostMult(){
            return (this.hypercendU[3].level.gte(1)?N(0.5).div(this.transcendU[5].level.mul(0.1).add(1)):this.goldenPeiEffects.upgradeCostReduction)
            .mul(this.ascendU[10].level.mul(-0.02).add(1))
            .mul(this.ascendU[12].level.gte(1)?0.2:1)
            .mul(Decimal.pow(0.99,this.transcendU[3].level))
        },
        baseClick() {
            let base = N(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*177.8+1778:this.goldenPeiEffects.clickMultiplier);
            const bld1 = this._getUpgradesByBuilding(1);
            let mult = bld1.filter(u => u.id < 4).reduce((prod, upgrade) => {
                return upgrade.unlocked ? prod.mul(2) : prod;
            }, N(1))
            .add(bld1.find(u => u.id == 4).unlocked?
                bld1.filter(u => u.id > 4 && u.id <= 20).reduce((prod, upgrade) => {
                    return upgrade.unlocked ? prod.mul(this.transcendU[6].level.mul(0.1).add(1).mul(this.transcendU[15].level.gte(1)?100:20)) : prod;
                }, N(1)).mul(this.ascendU[13].level.gte(1)?1000: 1).mul(this.buildingCount):N(0))
            .mul(this._getUpgradesByBuilding(101).reduce((prod, upgrade) => {
                return upgrade.unlocked ? prod.mul(1.01) : prod;
            }, N(1)))
            .mul(Decimal.pow(1.1+(this.breakCount.max(5).min(8).sub(4).mul(0.025).toNumber()),this.transcendU[1].level));
            return base.mul(mult);
        },
        totalClick(){
            return this.baseClick.mul(this.sugarBonus).mul(this.milkBonus).mul(this.upgradeBonus)
            .mul(this.ascendBonus).mul(this.transcendBonus).mul(this.breakBonus).mul(this.hypercendBonus)
            .mul(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*2.2+22:this.goldenPeiEffects.buildingMultiplier);
        },
        baseProduction() {
            // 使用 markRaw 避免中间 Decimal 对象被 Proxy 代理
            const sugarVal = this.sugar.add(41.001);
            let base = N(0);
            for (let index = 0; index < this.buildings.length; index++) {
                const building = this.buildings[index];
                const prod = building.quantity.mul(building.baseProd).mul(this.buildingMult(index)).mul(sugarVal.sub(index).div(42).floor().div(100).add(1));
                building.production = prod;
                base = base.add(prod);
            }
            return base;
        },
        totalProduction(){
            return this.baseProduction.mul(this.milkBonus).mul(this.sugarBonus).mul(this.upgradeBonus)
            .mul(this.ascendBonus).mul(this.transcendBonus).mul(this.breakBonus).mul(this.hypercendBonus)
            .mul(this.hypercendU[3].level.gte(1)?this.transcendU[5].level.toNumber()*2.2+22:this.goldenPeiEffects.buildingMultiplier);
        },
        buildingCount() {
            let sum = N(0);
            for (let i = 0; i < (this.buildings.length - 1); i++) sum = sum.add(this.buildings[i].quantity);
            return sum;
        },
        unlockedUpgradesCount() {
            // 使用缓存的计数器，避免每次遍历 1400+ 个升级
            if (this._unlockedUpgradesCount !== undefined) return this._unlockedUpgradesCount;
            this._unlockedUpgradesCount = this.upgrades.filter(u => u.unlocked).length;
            return this._unlockedUpgradesCount;
        },
        unlockedAchievementsCount() {
            if (this._unlockedAchievementsCount !== undefined) return this._unlockedAchievementsCount;
            this._unlockedAchievementsCount = this.achievements.filter(a => a.unlocked).length;
            return this._unlockedAchievementsCount;
        },
        advancedAchievementsCount() {
            return this.advancedAchievements.reduce((sum, achievement) => sum.add(achievement.completedTimes), N(0));
        },
        canAscend() {
            return this.totalLifetimePei.gte(1e12);
        },
        canTranscend(){
            return this.totalRealityShards.gte(1e12);
        },
        canBreak(){
            return this.totalTranscendPoints.gte(Decimal.pow(10,this.breakCount).mul(1e12));
        },
        canHypercend(){
            return this.totalLifetimePei.gte(1e308) & this.breakCount.gte(8);
        },
        totalShards() {
            return (this.totalLifetimePei.gte(1e48) ? this.totalLifetimePei.pow(1 / 4).floor() : this.totalLifetimePei.div(1e12).pow(1 / 3).floor())
            .mul(Decimal.pow(256,this.spaceU[3].level));;
        },
        nextShards() {
            return this.totalShards.gte(1e12) ? this.totalShards.add(1).pow(4) : this.totalShards.add(1).pow(3).mul(1e12);
        },
        totalTP(){
            return (this.totalRealityShards.gte(1e48) ? this.totalRealityShards.pow(1 / 4).floor() : this.totalRealityShards.div(1e12).pow(1 / 3).floor())
            .mul(Decimal.pow(16,this.spaceU[5].level));
        },
        nextTP(){
            return this.totalTP.max(this.totalTranscendPoints).gte(1e12) ? this.totalTP.max(this.totalTranscendPoints).add(1).pow(4) : this.totalTP.max(this.totalTranscendPoints).add(1).pow(3).mul(1e12);
        },
        nextBreak(){
            return Decimal.pow(10,this.breakCount).mul(1e12);
        },
        HPGain(){
            return Decimal.pow(this.totalLifetimePei, 1/308).sub(9).mul(this.HPmult).max(1).floor();
        },
        HPmult(){
            return (this.breakCount.gte(24)?this.breakCount.mul(0.25).add(1):N(1))
            .mul(this.hyperChargeU[6].unlocked?this.hyperEffect(7):1)
            .mul(this.hyperChargeU[10].unlocked?this.hyperEffect(11):1)
            .mul(this.hyperChargeU[11].unlocked?this.hyperEffect(12):1)
            .mul(this.hyperChargeU[12].unlocked?this.hyperEffect(12):1)
            .mul(this.hyperChargeU[13].unlocked?this.hyperEffect(12).pow(2/3):1)
            .mul(this.hyperChargeU[14].unlocked?this.hyperEffect(12).pow(2/3):1)
            .mul(this.hyperChargeU[15].unlocked?this.hyperEffect(12).pow(2/3):1)
            .mul(Decimal.pow(2,this.spaceU[7].level))
            .mul(this.sweetenCount.gte(16)?this.sweetenCount.mul(this.sweetenCount.gte(24)?10:2.5).add(1):1);
        },
        HCProduction(){
            return this.hypercendU[0].level.pow(2)
            .mul(this.hypercendU[1].level.mul(0.49).add(1).pow(2))
            .mul(this.hypercendU[2].level.mul(0.19).add(1).pow(2))
            .mul(this.hypercendU[3].level.mul(0.09).add(1).pow(2))
            .mul(this.hypercendU[4].level.mul(0.04).add(1).pow(2))
            .mul(this.hypercendU[5].level.mul(0.01).add(1).pow(2))
            .mul(this.hyperChargeU[0].unlocked?this.hyperEffect(1):1)
            .mul(this.hyperChargeU[1].unlocked?this.hyperEffect(2):1)
            .mul(this.hyperChargeU[2].unlocked?this.hyperEffect(3):1)
            .mul(this.hyperChargeU[3].unlocked?this.hyperEffect(4).pow(3):1)
            .mul(this.hyperChargeU[4].unlocked?this.hyperEffect(5).pow(3):1)
            .mul(this.hyperChargeU[5].unlocked?this.hyperEffect(6).pow(3):1)
            .mul(this.hyperChargeU[7].unlocked?this.hyperEffect(8).pow(12):1)
            .mul(this.hyperChargeU[8].unlocked?this.hyperEffect(9):1)
            .mul(this.hyperChargeU[9].unlocked?this.hyperEffect(4).pow(3).mul(this.hyperEffect(8).pow(12)):1)
            .mul(this.hyperChargeU[11].unlocked?this.hyperEffect(12).pow(24):1)
            .mul(this.hyperChargeU[12].unlocked?this.hyperEffect(12).pow(24):1)
            .mul(this.hyperChargeU[13].unlocked?this.hyperEffect(12).pow(16):1)
            .mul(this.hyperChargeU[14].unlocked?this.hyperEffect(12).pow(16):1)
            .mul(this.hyperChargeU[15].unlocked?this.hyperEffect(12).pow(16):1)
            .mul(this.hyperChargeU[16].unlocked?this.hyperEffect(17).pow(45):1)
            .mul(this.hyperChargeU[17].unlocked?this.hyperEffect(18).pow(45):1)
            .mul(this.hyperChargeU[18].unlocked?this.hyperEffect(19).pow(45):1)
            .mul(this.hyperChargeU[19].unlocked?this.hyperEffect(17).pow(15).mul(this.hyperEffect(18).pow(15)).mul(this.hyperEffect(19).pow(15)):1)
            .mul(this.breakCount.gte(32)?Decimal.pow(2,this.breakCount.sub(26).max(1).min(64)):1)
            .mul(Decimal.pow(4,this.spaceU[9].level));
        },
        canSpaceReset(){
            return this.totalLifetimePei.gte("1e20000") && this.totalFosskie.gte(1e60);
        },
        nutGain(){
            return Decimal.pow(10, Math.sqrt(this.totalLifetimePei.add(10).log(10) * this.totalFosskie.add(10).log(10))/1600)
            .mul(this.sweetenCount.mul(0.05).add(1)).floor();
        },
        canSpiceReset(){
            return this.totalLifetimePei.gte("1e1250000") && this.totalStarkie.gte(1e80);
        },
        cinnamonGain(){
            return Decimal.pow(10, Math.sqrt(this.totalLifetimePei.add(10).log(10) * this.totalStarkie.add(10).log(10))/10000).div(10)
            .mul(this.dreamCount.gte(2)?this.dreamCount.mul(0.05).add(1):1).floor();
        },
        vanillaGain(){
            return Decimal.pow(10, Math.sqrt(this.totalLifetimePei.add(10).log(10) * this.totalStarkie.add(10).log(10))/10000).div(10)
            .mul(this.dreamCount.gte(4)?this.dreamCount.mul(0.05).add(1):1).floor();
        },


        fosskiePerSecond(){
            return this.peiLives.reduce((sum, p, index) => {
                return p.auto? sum.add(p.baseProd.mul(p.level).mul(this.calcLifeMult(index).mul(this.calcSpeedMult(index)).div(p.duration))) : sum;
            }, N(0));
        },
        fosskiePerClick(){
            return this.fosskiePerSecond.div(20).add(1).mul(this.traits[36].level.mul(0.2).add(1));
        },
        icingGain(){
            return (this.resetFosskie.gte(1e48)? this.resetFosskie.pow(1/4).floor(): this.resetFosskie.div(1e12).pow(1/3).floor())
            .mul(this.sweetenCount.gte(3)?10000:1)
            .mul(Decimal.pow(2,this.spaceU[2].level))
            .mul(this.saltU[1].level.add(1));
        },
        honeyGain(){
            return (this.resetFosskie.gte(1e192)? this.resetFosskie.pow(1/16).floor(): this.resetFosskie.div(1e48).pow(1/12).floor())
            .mul(this.sweetenCount.gte(7)?10:1)
            .mul(Decimal.pow(2,this.spaceU[4].level))
            .mul(this.saltU[2].level.add(1));
        },
        nextSweeten(){
            return Decimal.pow(1e16,this.sweetenCount).mul(1e192);
        },
        caramelMult(){
            return (this.sweetenCount.gte(12)?this.sweetenCount.mul(this.sweetenCount.gte(24)?1:0.25).add(1):N(1))
            .mul(Decimal.pow(2,this.spaceU[6].level))
            .mul(this.nobreakRecord.gte('1e50000')?N(this.totalLifetimePei.add(10).log(10)).pow(1/6):1)
            .mul(this.saltU[3].level.add(1));
        },
        caramelGain(){
            return this.resetFosskie.pow(1/256).sub(10).mul(this.caramelMult).floor();
        },
        SCproduction(){
            return this.refineryU[0].level
            .mul(this.totalCaramel)
            .mul(Decimal.pow(1.096478,this.refineryU[1].level))
            .mul(Decimal.pow(1.071519,this.refineryU[2].level))
            .mul(Decimal.pow(1.047129,this.refineryU[3].level))
            .mul(Decimal.pow(1.023293,this.refineryU[4].level))
            .mul(Decimal.pow(2,this.spaceU[8].level));
        },

        starkiePerSecond(){
            return this.peiCeles.reduce((sum, p, index) => {
                return sum.add(p.baseProd.mul(p.level).mul(this.calcCeleMult(index).mul(this.calcCeleSpeedMult(index)).div(p.duration)));
            }, N(0));
        },
        starkiePerClick(){
            return this.starkiePerSecond.div(20).add(1);
        },
        milkExpReq(){
            return this.milkLevel.lt(100)?Decimal.pow(1000,this.milkLevel.toNumber()+1):N("1e1000000000000000");
        },
        cheeseGain(){
            return (this.resetStarkie.gte(1e48)? this.resetStarkie.pow(1/4).floor(): this.resetStarkie.div(1e12).pow(1/3).floor())
            .mul(this.dreamCount.gte(3)?10:1);
        },
        creamGain(){
            return (this.resetStarkie.gte(1e192)? this.resetStarkie.pow(1/16).floor(): this.resetStarkie.div(1e48).pow(1/12).floor())
            .mul(this.dreamCount.gte(6)?10:1);
        },
        nextDream(){
            return Decimal.pow(1e16,this.dreamCount).mul(1e192);
        },
        butterMult(){
            return N(1);
        },
        butterGain(){
            return this.resetStarkie.pow(1/256).sub(10).mul(this.butterMult).floor();
        },
        MCproduction(){
            return this.refineryU[0].level
            .mul(this.totalButter)
            .mul(Decimal.pow(1.096478,this.refineryU[1].level))
            .mul(Decimal.pow(1.071519,this.refineryU[2].level))
            .mul(Decimal.pow(1.047129,this.refineryU[3].level))
            .mul(Decimal.pow(1.023293,this.refineryU[4].level))
            ;
        },
        
        goldenPeiTimeCap(){
            return (this._getUpgradesByBuilding(107).find(u => u.id == 1).unlocked ? 210 : 420) 
            / (this.ascendU[5].level.toNumber()*0.1+1)
            / (this.transcendU[17].level.toNumber()*0.05+1);
        },
        sugarTimeCap(){
            return 3600 
            / (this.ascendU[14].level.toNumber()*0.2+1)
            / (this.transcendU[16].level.toNumber()*0.2+1)
            / (this.breakCount.gte(40)?this.breakCount.sub(30).max(1).min(80).toNumber()*0.05+1:1)
            //*(this.sugar.gte(1000)?this.sugar.toNumber()+1:1)
        },
        sugarGain(){
            return this.breakCount.max(1).min(10)
            .add(this.breakCount.gte(1000)?this.breakCount.div(1000):0)
            .mul(this.sweetenCount.gte(2)?this.sweetenCount.toNumber()*0.1+1:1)
            .mul(this.traits[37].level.toNumber()*0.2+1)
            .mul(this.sweetenCount.gte(4)?2:1)
            .mul(this.spaceU[11].level.mul(0.1).add(1));
        },
        sugarPerSecond(){
            return this.sugarGain.div(this.sugarTimeCap);
        },
        milkCount(){
            return N(this.unlockedAchievementsCount)
            .add(this.advancedAchievementsCount)
            .mul(this.breakCount.gte(3)?2:1)
            .mul(this.spaceU[10].level.mul(0.1).add(1));
        },
        saltTimeCap(){
            return 4000
            /(this.sweetenCount.gte(6)?2:1)
            /(this.spaceRecord.gte('1e80000')?2:1)
            *(this.salt.toNumber()+1)
        },
        saltGain(){
            return (this.sweetenCount.gte(20)?this.sweetenCount.mul(0.1).add(1):N(1));
        },
        saltPerSecond(){
            return this.saltGain.div(this.saltTimeCap);
        },
        dataKieBaseProduction(){
            let base = N(0);
            for (let index = 0; index < this.exploreArea.length; index++) {
                const area = this.exploreArea[index];
                const prod = area.quantity.mul(area.baseProd).mul(this.exploreAreaMult(index));
                area.production = prod;
                base = base.add(prod);
            }
            return base;
        },
        exploreAreaMult(index){
            let mult = N(1);
            mult = mult.mul(Decimal.pow(2, this.exploreUpgrades[index].level));
            mult = mult.mul(this.flourMult);
            mult = mult.mul(this.matchaMult);
            mult = mult.mul(this.coffeeMult);
            mult = mult.mul(this.terminalMult);
            return mult;
        },
        flourMult(){
            return Decimal.pow(2, this.flour);
        },
        matchaMult(){
            return Decimal.pow(2, this.totalMatcha);
        },
        coffeeMult(){
            return Decimal.pow(2, this.totalCoffee);
        },
        terminalMult(){
            return Decimal.pow(1.1, this.terminalUpgrades.reduce((sum, u) => sum.add(u.level), N(0)));
        },
        dataKiePerSecond(){
            return this.dataKieBaseProduction;
        },
        dataKiePerClick(){
            return this.dataKiePerSecond.div(20).add(1);
        },
        dataKie(){
            return this.datakie;
        },
        matchaGain(){
            if(this.datakie.lt(1e12)) return N(0);
            return this.datakie.div(1e12).pow(0.5).floor().mul(Decimal.pow(2, this.exploreUpgrades[0].level)).max(1);
        },
        coffeeGain(){
            if(this.datakie.lt(1e48)) return N(0);
            return this.datakie.div(1e48).pow(0.5).floor().mul(Decimal.pow(2, this.exploreUpgrades[1].level)).max(1);
        },
        gelatinGain(){
            if(this.datakie.lt(818268448)) return N(0);
            return this.datakie.div(818268448).pow(0.5).floor().max(1);
        },
    },
    created() {
        // 将模块级不可变变量挂载到实例上，供模板访问
        // 不放在 data() 中，避免 Vue 3 Proxy 代理导致性能问题
        this.texts = markRaw(TEXTS);

        this._tabSet1a = new Set([0,1,2,4,5,6,10,11]);
        this._tabSet1b = new Set([0,1,2,3,4,5,6,7,8,9,10,11]);
        this._tabSet2 = new Set([3,11,12,13,14,15,16,17]);
        this._tabSet3 = new Set([3,11,18,19,20,21,22,23,24,25]);
        this._tabSet4 = new Set([3,11,26,27,28,29,30,31,32,33]);
        this._tabSet5 = new Set([3,11,34,35,36,37,38,39,40,41]);
        this._tabSet6 = new Set([3,11,40,41,42,43,44,45]);
        this.milkUpgradeBase = milkUpgradeBase;
        this.milkUpgradeBase2 = milkUpgradeBase2;
        this.N = N;
        this.Decimal = Decimal;
        this.Math = Math;
        
        // 构建 upgrades 按 buildingId 的索引缓存，避免每次 filter() 遍历 1420 个元素
        this._rebuildUpgradeIndex();
        // 构建 achievements 按 buildingId 的索引缓存
        this._achByBuilding = {};
        this.achievements.forEach(a => {
            if (!this._achByBuilding[a.buildingId]) this._achByBuilding[a.buildingId] = [];
            this._achByBuilding[a.buildingId].push(a);
        });
    },
    mounted() {
        // 开发环境调试 API
        window.$game = this;
        window.Decimal = Decimal;
        console.log('[Pelkie Clicker V3] 调试 API 已加载！');
        console.log('使用 window.$game 访问游戏数据和方法');
        console.log('示例: $game.peiCount, $game.buyBuilding(0)');
        
        this.localLoad();
        this.lastUpdate = Date.now();

        //主循环 - 50ms间隔（每秒20次），足够流畅且大幅减少CPU占用
        setInterval(() => {
            const now = Date.now();
            const delta = (now - this.lastUpdate) / 1000;
            // 缓存 computed 值，避免同一 tick 内多次求值
            const prod = this.totalProduction;
            this.peiPerClick = this.totalClick;
            this.peiPerSecond = prod;
            const prodDelta = prod.mul(delta);
            this.peiCount = this.peiCount.add(prodDelta);
            this.thisAscendPei = this.thisAscendPei.add(prodDelta);
            this.totalLifetimePei = this.totalLifetimePei.add(prodDelta);
            this.breakTimer = this.breakTimer.add(delta);
            if (this.playTime >= this.sugarTimeCap) {
                this.playTime = this.playTime - this.sugarTimeCap;
                this.sugar = this.sugar.add(this.sugarGain);
            }
            if(this.playTime2 >= this.saltTimeCap) {
                this.playTime2 = this.playTime2 - this.saltTimeCap;
                this.salt = this.salt.add(this.saltGain);
            }
            if(this.hypercendU[0].level.gte(1)) this.hyperCharge = this.hyperCharge.add(this.HCProduction.mul(delta));
            if(this.refineryU[0].level.gte(1)) this.sugarCharge = this.sugarCharge.add(this.SCproduction.mul(delta));
            if(this.automation[9].activate & this.breakCount.gte(8)) {
                const hpDelta = this.HPGain.mul(delta);
                this.hypercendPoints = this.hypercendPoints.add(hpDelta);
                this.totalHypercendPoints = this.totalHypercendPoints.add(hpDelta);
                this.maxHypercendPoints = this.maxHypercendPoints.add(hpDelta);
            }
            if(this.automation[15].activate) {
                const iDelta = this.icingGain.mul(delta);
                this.icing=this.icing.add(iDelta);
                this.totalIcing=this.totalIcing.add(iDelta);
            }
            if(this.automation[17].activate) {
                const hDelta = this.honeyGain.mul(delta);
                this.honey=this.honey.add(hDelta);
                this.totalHoney=this.totalHoney.add(hDelta);
            }
            if(this.automation[20].activate) {
                const cDelta = this.caramelGain.mul(delta);
                this.caramel=this.caramel.add(cDelta);
                this.totalCaramel=this.totalCaramel.add(cDelta);
            }
            if(this.automation[23].activate) {
                this.nutCount = this.nutCount.add(this.nutGain.mul(delta));
            }
            if(this.automation[27].activate) {
                const chDelta = this.cheeseGain.mul(delta);
                this.cheese=this.cheese.add(chDelta);
                this.totalCheese=this.totalCheese.add(chDelta);
            }
            if(this.automation[29].activate) {
                const crDelta = this.creamGain.mul(delta);
                this.cream=this.cream.add(crDelta);
                this.totalCream=this.totalCream.add(crDelta);
            }
            
            // 更新蚂蚁数量
            this.updateAnts(delta);
            
            if(this.condenseryU[0].level.gte(1)) this.milkCharge = this.milkCharge.add(this.calcMilkChargeSpeed().mul(delta));
            
            if(this.condenseryU[4].level.gte(1)){
                this.magicAmount = this.magicAmount.add(this.calcMagicProduction().mul(delta));
                this.magicCap = this.calcMagicCap();
                if(this.magicAmount.gt(this.magicCap)) this.magicAmount = this.magicCap;
                for(const skill of this.magicSkills){
                    if(skill.active){
                        skill.timer -= delta;
                        if(skill.timer <= 0){
                            skill.active = false;
                            skill.timer = 0;
                        }
                    }
                }
            }
            
            if(this.challenges[4].completedTimes.gte(1) && this.antsDriven.gte(1e10)){
                const dkProd = this.dataKiePerSecond;
                const dkDelta = dkProd.mul(delta);
                this.datakie = this.datakie.add(dkDelta);
                this.totalDatakie = this.totalDatakie.add(dkDelta);
            }
            
            this.lastUpdate = now;
        },50);

        //自动购买器循环
        setInterval(() => {
            this.checkAchievements(101);
            this.checkAchievements(102);
            this.checkAchievements(103);
            this.checkAchievements(104);
            this.checkAchievements(105);
            this.checkAchievements(106);
            this.checkAdvancedAchievements();
            this.checkExploreAchievements();
            if(this.automation[0].activate) this.buyAllBuilding();
            if(this.automation[1].activate) this.buyAllUpgrades();
            if(this.automation[2].activate) this.peiCount=this.peiCount.add(this.peiPerClick);
            if(this.automation[3].activate) this.clickGoldenPei();
            if(this.automation[4].activate) this.buyAllAscendU();
            if(this.automation[5].activate) {this.realityShards=this.totalRealityShards.max(this.totalShards); this.totalRealityShards=this.totalRealityShards.max(this.totalShards);}
            if(this.automation[6].activate) this.buyAllTranscendU();
            if(this.automation[7].activate) {this.transcendPoints=this.totalTranscendPoints.max(this.totalTP); this.totalTranscendPoints=this.totalTranscendPoints.max(this.totalTP);}
            if(this.automation[8].activate) {this.breakCount = this.breakCount.max(Math.floor(this.totalTranscendPoints.div(1e11).max(1).log(10))); this.milk=this.milkCount;}
            if(this.automation[10].activate) this.buyMaxPeiLife();
            if(this.automation[11].activate) this.buyMaxTrait1();
            if(this.automation[12].activate) {this.fosskie = this.fosskie.add(this.fosskiePerClick);this.totalFosskie = this.totalFosskie.add(this.fosskiePerClick);this.resetFosskie = this.resetFosskie.add(this.fosskiePerClick);};
            if(this.automation[13].activate) this.buyMaxTrait2();
            if(this.automation[14].activate) this.buyAllHypercendU();
            if(this.automation[16].activate) this.buyAllHyperChargeU();
            if(this.automation[18].activate) {this.sweetenCount = this.sweetenCount.max(Math.floor(this.resetFosskie.div(1e176).max(1).log(1e16)))}
            if(this.automation[19].activate) this.buyMaxTrait3();
            if(this.automation[21].activate) this.buyAllRefineryU();
            if(this.automation[22].activate) this.buyAllSpaceU();
            if(this.automation[24].activate) this.buyMaxPeiCele();
            if(this.automation[25].activate) {this.starkie = this.starkie.add(this.starkiePerClick);this.totalStarkie = this.totalStarkie.add(this.starkiePerClick);this.resetStarkie = this.resetStarkie.add(this.starkiePerClick);};
            if(this.automation[26].activate) this.buyMaxEnhan1();
            if(this.automation[28].activate) this.buyMaxEnhan2();
            if(this.advancedAutomation[0].activate) { for(let i=0;i<14;i++) this.buyExploreArea(i); }
            if(this.advancedAutomation[1].activate) { for(let i=1;i<=14;i++) this.buyExploreUpgrade(i); }
            if(this.advancedAutomation[2].activate) { this.datakie = this.datakie.add(this.dataKiePerClick); this.totalDatakie = this.totalDatakie.add(this.dataKiePerClick); }
            if(this.advancedAutomation[3].activate) { this.matcha = this.matcha.add(this.matchaGain.mul(0.001)); this.totalMatcha = this.totalMatcha.add(this.matchaGain.mul(0.001)); }
            if(this.advancedAutomation[4].activate) { this.coffee = this.coffee.add(this.coffeeGain.mul(0.001)); this.totalCoffee = this.totalCoffee.add(this.coffeeGain.mul(0.001)); }
            if(this.advancedAutomation[5].activate && this.datakie.gte(1e12)) this.matchaReset();
            if(this.advancedAutomation[6].activate && this.datakie.gte(1e48)) this.coffeeReset();
            if(this.advancedAutomation[7].activate) this.buyMaxPeiCele();
            if(this.advancedAutomation[8].activate) this.buyMaxEnhan1();
            if(this.advancedAutomation[9].activate) this.buyMaxEnhan2();
            if(this.advancedAutomation[10].activate && this.datakie.gte(818268448)) this.terminalReset();
        },100);

        //糖块、金佩勒循环
        setInterval(() => {
            if(this.enableGolden) this.goldenPeiTimer++
            this.playTime++;
            if(this.spaceResetCount.gte(1)) this.playTime2=this.playTime2+(this.sugar.toNumber());
            this.totalPlayTime++;
            let t = this.goldenPeiTimeCap;
            let l = this._getUpgradesByBuilding(107).find(u => u.id == 1).unlocked ? 26 : 13;
            if (this.goldenPeiTimer >= t) {
                this.goldenPeiVisible = true;
                setTimeout(() => {
                    this.goldenPeiVisible = false;
                }, 1000*l);
                this.goldenPeiTimer = 0;
            }
        }, 1000);

        //自动保存
        setInterval(() => {
            this.localSave();
        },10000)
    }
}
</script>

<style>
body {
    text-align: center;
    font-family: MonospaceTypewriter, monospace;
}

button {
    text-align: center;
    font-family: MonospaceTypewriter, monospace;
    font-size: 16px;
}

.container {
display: flex;
flex-direction: column;
align-items: center;
margin: 0 auto;
max-width: 540px;
width: 100%;
background: #ffffff;
border-radius: 10px;
}

/* 移动端适配优化 */
@media (max-width: 540px) {
    .container {
        width: 100%;
    }
}

.header-fixed {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(5px);
    z-index: 100;
    width: 100%;
}

.header-text{
    font-weight: bold;
    line-height:150%;
}

.tabs {
    display: grid;
    grid-template-columns: repeat(4, minmax(130px,1fr)); /* 4列 */
    grid-auto-rows: minmax(40px, auto); /* 行高 */
    gap: 5px; /* 间距 */
    margin: 10px 0;
}

.tab {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    font-size: 16px;
}

/* 响应式适配 */
@media (max-width: 540px) {
    .tabs {
        grid-template-columns: repeat(4, minmax(60px,130px));
    }

    .tab {
        font-size: 16px;
        padding: 5px;
    }
}

.active-tab {
    background-color: #f0f0f0;
}

.clickable {
    cursor: pointer;
}

.pei-image {
    margin: 0 auto;
    background-size: cover;
    background-position: center;
    border-radius: 8px;
}

.click-effects-container {
    position: relative;
    bottom: -50%;
    left: 30%;
    right: 0;
    pointer-events: none;
}

.click-effect {
    position: absolute;
    font-size: 16px;
    color: #114514;
    font-weight: bold;
    animation: floatUp 2s ease-out forwards;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

@keyframes floatUp {
    0% {
        transform: translateY(0);
        opacity: 1;
    }

    100% {
        transform: translateY(-100px);
        opacity: 0;
    }
}

/* 响应式调整 */
@media (max-width: 540px) {
    .big-pei {
        font-size: 80px;
    }

    .click-effect {
        font-size: 18px;
    }
}

.golden-pei {
    width: 50px;
    height: 50px;
    background-color: gold;
}

.golden-pei-hide {
    width: 50px;
    height: 50px;
    background-color: #cccccc;
}

.effect-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: #fff3e0;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-left: 5px solid #ff9800;
    animation: slideIn 0.3s ease-out;
}

.disabled {
    background-color: #ccc;
}

.divider {
    line-height:0px;
    color:white;
}

.building-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 1fr);
}

.building {
    border: 2px solid #ccc;
    border-radius: 8px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 添加这行 */
    background: #f8f8f8;
}

.bulk-selector {
    margin: 10px 0;
    padding: 5px;
    background: #f0f0f0;
}

.upgrade-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 1fr);
}

.upgrade {
    border: 2px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 添加这行 */
    background: #f8f8f8;
}

.achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 1fr);
}

.achievement {
    border: 2px solid #ccc;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f8f8f8;
}

    .achievement.unlocked {
        border-color: #4CAF50;
        background: #e8f5e9;
    }

.achievement-icon {
    font-size: 2em;
    margin-right: 15px;
}

.achievement-info h4 {
    margin: 0 0 5px 0;
    color: #333;
}

.achievement-info p {
    margin: 0;
    color: #666;
}

.achievement-info small {
    color: #999;
    font-size: 0.8em;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

.achievement-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
    border-left: 5px solid #4CAF50;
}

.shop {
    margin-top: 20px;
    border-top: 2px solid #666;
    padding-top: 15px;
}

.upgrade-item {
    border: 2px solid #aaa;
    padding: 10px;
    border-radius: 5px;
    background: rgba(248,248,248,0.2);
}

    .upgrade-item button {
        margin: 5px 0;
    }

    .upgrade-item.unlocked {
        border-color: #4CAF50;
        background: rgba(200,255,200,0.2);
    }


.space {
    background-color: #001c60;
    color:#FFE29F
}
.space-reset-section {
    background: rgba(0,0,0,0.3);
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}
.space-reset-button {
    background: #4a6cf7;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}
.space-reset-button:hover {
    background: #3a5ce7;
}
.reset-locked {
    color: #ff6b6b;
}
.reset-ready {
    color: #4ecdc4;
}
.space-upgrades-tree {
    margin-top: 20px;
}
.upgrade-node {
    margin: 5px 0;
    padding: 5px;
    border-radius: 5px;
    background: rgba(0,0,0,0.2);
}
.upgrade-node.unlocked {
    background: rgba(78,205,196,0.2);
}
.children-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-left: 5px;
    padding-left: 5px;
    border-left: 2px dashed #4ecdc4;
}
.upgrade-info {
    min-width: 300px;
}
        /* 进度条现代样式 */
.progress-bar {
    height: 16px;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    margin: 8px;
}
.progress-bar > div {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50 0%, #81C784 100%);
    border-radius: 8px;
}

.progress-bar2 {
    height: 16px;
    background: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    margin: 8px;
}
.progress-bar2 > div {
    height: 100%;
    background: linear-gradient(90deg, #4C50AF 0%, #8184C7 100%);
    border-radius: 8px;
}

.pei-life {
    background: white;
    border:#dfbf0d solid 2px;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.pei-cele {
    background: white;
    border:#0d1bdf solid 2px;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s, box-shadow 0.2s;
}

.offline-toast {
    position: fixed;
    right: 20px;
    bottom: 80px;
    background: #e3f2fd;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    border-left: 5px solid #2196F3;
    animation: slideIn 0.3s ease-out;
}
</style>
