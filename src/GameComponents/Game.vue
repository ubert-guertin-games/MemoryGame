/*
* @author Ubert Guertin
* @file /src/GameComponents/Game.vue
*/

<script setup lang="ts">
	  import { ref, type Ref, computed } from "vue";

	  import Card from "./Card.vue";
	  import GameData from "./Game.data.vue";

	  import CardModel from "../Models/Card.ts";
	  import { CardImagesManager } from "../Models/CardImagesManager.ts";

	  import { RATIO_GRID, DEFAULT_RATIO, DEFAULT_CARD_AUTO_FLIP_TIME_MS  } from "../Utils/constants.ts";
	  import shuffle from "../Utils/shuffle.ts";
	  import type { RowColumn, RatioObject } from "../Utils/type.ts";

	  import { numberOfErrors,numberOfInteractions } from "../Utils/globals.ts"; 


    // Variables locales
	  let cardCanBeFliped = true;
	  let ratio: RowColumn = DEFAULT_RATIO;

    // References 
    const allCards = ref<CardModel>([]);
	  const numberOfCards = defineModel('numberOfCards', { required: true });
	  const selectedCardIds = ref([]);
	  const comboFind = ref([]);
    const selectedCardIdsHistory = ref([]);

    // Event, fin du jeu
	  const emit = defineEmits(['endGame']);

  	for (let i=0; i<numberOfCards.value; i++) {
	    	allCards.value.push(new CardModel());
		    allCards.value = shuffle<CardModel>(allCards.value);
	  }


    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function addSelectedCard(card: CardModel) {
        // Bloque seulement si on est en train de résoudre ET qu'on a déjà 2 cartes
        if (timeoutId !== null && selectedCardIds.value.length >= 2) {
            // Annuler le timeout et résoudre immédiatement
            clearTimeout(timeoutId);
            timeoutId = null;
            resolveCurrentPair();
        }

        if (!cardCanBeFliped) return;
        if (comboFind.value.includes(card.patternId)) return;
        if (selectedCardIds.value.some(c => c.uniqueId === card.uniqueId)) return;

        card.isVisible = true;
        selectedCardIds.value.push(card);
        selectedCardIdsHistory.value.push(card.uniqueId);

        // Si on a 2 cartes, déclencher la comparaison avec délai
        if (selectedCardIds.value.length !== 2) return;

        cardCanBeFliped = false;
        numberOfInteractions.value++;

        timeoutId = setTimeout(() => {
            resolveCurrentPair();
            timeoutId = null;
        }, DEFAULT_CARD_AUTO_FLIP_TIME_MS);
    }

    function resolveCurrentPair() {
	      const len = selectedCardIds.value.length;

	      if (len >= 2) {
            const card1 = selectedCardIds.value[len - 2];
		        const card2 = selectedCardIds.value[len - 1];

			      // Combo trouvé
		        if (card1.patternId === card2.patternId) {
			          comboFind.value.push(card1.patternId);
	              const isEndGame: boolean = (
                    (comboFind.value.length * 2) === Number(numberOfCards.value)
                );

                if (isEndGame) {
				            emit('endGame');
			          }
		        } 

		        // Mauvaise paire
            else {
			          card1.isVisible = false;
			          card2.isVisible = false;
      
                const numberOfCard1 = selectedCardIdsHistory.value.filter(uid => uid === card1.uniqueId).length;
                const numberOfCard2 = selectedCardIdsHistory.value.filter(uid => uid === card2.uniqueId).length;
      
                if (numberOfCard1 > 1 || numberOfCard2 > 1) {
                    numberOfErrors.value++;
                }
		        }
	      }

	      selectedCardIds.value.length = 0;
	      cardCanBeFliped = true;
    }

	  if (Object.keys(RATIO_GRID).includes(numberOfCards._value.toString())) {
        ratio = RATIO_GRID[numberOfCards._value.toString()];
	  }

	  // Change grid ratio
	  const dynamicCssGrid: string = `
		    grid-template-rows: repeat(${ratio[0]}, 120px);
		    grid-template-columns: repeat(${ratio[1]}, 80px);
	  `;
</script>

<template>
  <main>
		<div class="grid" :style="dynamicCssGrid">
			<Card
				class="cards"

				v-for="card in allCards"
				:key="card.uniqueId"

				:isVisible="card.isVisible"
				:isActive="comboFind.includes(card.patternId)"
				:card="card"

				@click="addSelectedCard(card)"
			/>
		</div>
	</main>

	<GameData :endScreen="false"/>
</template>

<style scoped>
  @import "/styles/game.component.css";
</style>
