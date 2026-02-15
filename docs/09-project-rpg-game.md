# ⚔️ Project 10: RPG Game (โปรเจกต์ — เกม RPG ต่อสู้) ⚔️

> **บทนี้จะ Combine ทุกอย่างที่เรียนใน Module 9:**
> Classes + Inheritance + Prototypes = **เกม OOP จริงจัง!**

---

## 🎯 Project Goal

สร้าง **Console RPG Battle Game** ที่มี:
1. **Class Hierarchy:** Character → Warrior, Mage, Archer
2. **Battle System:** สลับเทิร์นโจมตี
3. **Special Skills:** แต่ละ Class มีสกิลพิเศษ
4. **Inventory:** เก็บ Item (Potion, etc.)

---

## 📐 Class Diagram

```
        Character (Base)
        ├── name, hp, maxHp, attack, defense
        ├── takeDamage(), heal(), isAlive(), toString()
        │
        ├── Warrior (extends Character)
        │   ├── weapon, rage
        │   └── powerStrike(), battleCry()
        │
        ├── Mage (extends Character)
        │   ├── mana, maxMana
        │   └── castSpell(), meditate()
        │
        └── Archer (extends Character)
            ├── arrows
            └── quickShot(), tripleShot()
```

---

## ✅ Full Solution

::: details ✨ ดูเฉลย Character Class (Base)
```javascript
class Character {
    #hp;
    #maxHp;

    constructor(name, hp, attack, defense) {
        this.name = name;
        this.#hp = hp;
        this.#maxHp = hp;
        this.attack = attack;
        this.defense = defense;
        this.inventory = [];
    }

    get hp() { return this.#hp; }
    get maxHp() { return this.#maxHp; }

    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.#hp = Math.max(0, this.#hp - actualDamage);
        return actualDamage;
    }

    heal(amount) {
        this.#hp = Math.min(this.#maxHp, this.#hp + amount);
    }

    isAlive() {
        return this.#hp > 0;
    }

    basicAttack(target) {
        const damage = target.takeDamage(this.attack);
        return `${this.name} attacks ${target.name} for ${damage} damage!`;
    }

    useItem(itemName) {
        const index = this.inventory.indexOf(itemName);
        if (index === -1) return `${this.name} doesn't have ${itemName}!`;
        this.inventory.splice(index, 1);
        if (itemName === "Potion") {
            this.heal(30);
            return `${this.name} uses Potion! +30 HP (${this.hp}/${this.maxHp})`;
        }
        return `${this.name} uses ${itemName}`;
    }

    toString() {
        const hpBar = "█".repeat(Math.round(this.hp / this.maxHp * 10));
        const empty = "░".repeat(10 - hpBar.length);
        return `${this.name} [${hpBar}${empty}] ${this.hp}/${this.maxHp} HP`;
    }
}
```
:::

::: details ✨ ดูเฉลย Warrior, Mage, Archer Classes
```javascript
class Warrior extends Character {
    constructor(name) {
        super(name, 120, 15, 10);
        this.weapon = "Sword";
        this.rage = 0;
    }

    basicAttack(target) {
        this.rage += 10;
        return super.basicAttack(target) + ` ⚔️ (Rage: ${this.rage})`;
    }

    powerStrike(target) {
        if (this.rage < 30) return `${this.name}: Not enough rage! (${this.rage}/30)`;
        this.rage -= 30;
        const damage = target.takeDamage(this.attack * 2);
        return `${this.name} uses POWER STRIKE on ${target.name}! 💥 ${damage} damage!`;
    }
}

class Mage extends Character {
    #mana;
    #maxMana;

    constructor(name) {
        super(name, 80, 10, 5);
        this.#mana = 100;
        this.#maxMana = 100;
    }

    get mana() { return this.#mana; }

    castSpell(spellName, target) {
        const spells = {
            "Fireball": { cost: 25, multiplier: 3 },
            "Ice Bolt": { cost: 15, multiplier: 2 },
            "Thunder": { cost: 40, multiplier: 4 },
        };

        const spell = spells[spellName];
        if (!spell) return `Unknown spell: ${spellName}`;
        if (this.#mana < spell.cost) return `Not enough mana! (${this.#mana}/${spell.cost})`;

        this.#mana -= spell.cost;
        const damage = target.takeDamage(this.attack * spell.multiplier);
        return `${this.name} casts ${spellName}! 🔮 ${damage} damage! (Mana: ${this.#mana})`;
    }

    meditate() {
        this.#mana = Math.min(this.#maxMana, this.#mana + 20);
        return `${this.name} meditates... 🧘 +20 Mana (${this.#mana})`;
    }
}

class Archer extends Character {
    constructor(name) {
        super(name, 90, 18, 6);
        this.arrows = 20;
    }

    quickShot(target) {
        if (this.arrows <= 0) return `${this.name}: No arrows left!`;
        this.arrows--;
        const damage = target.takeDamage(this.attack * 1.5);
        return `${this.name} fires a quick shot! 🏹 ${damage} damage! (Arrows: ${this.arrows})`;
    }

    tripleShot(target) {
        if (this.arrows < 3) return `${this.name}: Need 3 arrows!`;
        this.arrows -= 3;
        let totalDamage = 0;
        for (let i = 0; i < 3; i++) {
            totalDamage += target.takeDamage(this.attack);
        }
        return `${this.name} fires TRIPLE SHOT! 🏹🏹🏹 ${totalDamage} total damage!`;
    }
}
```
:::

::: details ✨ ดูเฉลย Battle System
```javascript
function battle(player1, player2) {
    console.log("⚔️ === BATTLE START === ⚔️\n");
    console.log(player1.toString());
    console.log(player2.toString());
    console.log("");

    let turn = 1;
    const fighters = [player1, player2];

    while (player1.isAlive() && player2.isAlive()) {
        const attacker = fighters[(turn - 1) % 2];
        const defender = fighters[turn % 2];

        console.log(`--- Turn ${turn} (${attacker.name}) ---`);
        console.log(attacker.basicAttack(defender));
        console.log(defender.toString());
        console.log("");

        turn++;
        if (turn > 50) { console.log("Draw!"); return; }
    }

    const winner = player1.isAlive() ? player1 : player2;
    console.log(`🏆 ${winner.name} Wins!`);
}

// ใช้งาน:
const warrior = new Warrior("Arthus");
const mage = new Mage("Gandalf");

warrior.inventory.push("Potion", "Potion");
battle(warrior, mage);
```
:::

---

## 📋 Skills Used

| Skill | ใช้ตรงไหน |
|:------|:---------|
| **Class** | `Character`, `Warrior`, `Mage`, `Archer` |
| **Constructor** | ตั้งค่าเริ่มต้น (HP, Attack, etc.) |
| **Inheritance** | `extends Character` |
| **super()** | เรียก Parent Constructor |
| **Override** | `basicAttack()` ใน Warrior |
| **Getter** | `get hp()`, `get mana()` |
| **Private #** | `#hp`, `#mana` |
| **Method Chaining** | `this` return pattern |
| **Polymorphism** | แต่ละ Class มี attack ต่างกัน |
