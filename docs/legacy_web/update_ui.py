import re

html_path = r'C:\Users\Dell\.gemini\antigravity\scratch\mvab_v21_web\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update load initialization to check localStorage
init_logic = """
    let userResponses = JSON.parse(localStorage.getItem('mvab_responses') || '{}');

    document.addEventListener('DOMContentLoaded', () => {
      renderQuestions();
      updateProgressBar();
      lucide.createIcons();
    });
"""
content = re.sub(r'let userResponses = \{\};\s*document\.addEventListener\(\'DOMContentLoaded\', \(\) => \{\s*renderQuestions\(\);\s*updateProgressBar\(\);\s*lucide\.createIcons\(\);\s*\}\);', init_logic, content)


# 2. Update selectOption
select_option_logic = """
    function selectOption(itemId, val, event) {
      userResponses[itemId] = val;
      localStorage.setItem('mvab_responses', JSON.stringify(userResponses));
      updateProgressBar();
      
      // Update DOM classes instead of re-rendering everything
      const card = document.getElementById(`q-card-${itemId}`);
      if(card) {
        card.classList.remove('bg-white/70', 'border-slate-200/60');
        card.classList.add('bg-white', 'border-slate-200', 'shadow-sm');
        
        const buttons = card.querySelectorAll('button');
        buttons.forEach((btn, idx) => {
          if ((idx + 1) === val) {
            btn.className = 'flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-150 bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20';
          } else {
            btn.className = 'flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all duration-150 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200';
          }
        });
      }

      // Auto-advance
      setTimeout(() => {
        const allCards = Array.from(document.querySelectorAll('[id^="q-card-"]'));
        const currentIndex = allCards.findIndex(c => c.id === `q-card-${itemId}`);
        if (currentIndex !== -1 && currentIndex < allCards.length - 1) {
          const nextCard = allCards[currentIndex + 1];
          const offset = 100;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = nextCard.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 350);
    }
"""
content = re.sub(r'function selectOption\(itemId, val\) \{.*?\}', select_option_logic, content, flags=re.DOTALL)


# 3. Fix renderQuestions button HTML to pass event
render_btn_fix = """
          optionsHtml += `
            <button onclick="selectOption('${item.id}', ${pt}, event)" 
"""
content = re.sub(r'optionsHtml \+= `\s*<button onclick="selectOption\(\'\$\{item.id\}\', \$\{pt\}\)"', render_btn_fix, content)


# 4. Add legend below buttons
legend_html = """
          <div class="flex items-center gap-1.5 w-full">
            ${optionsHtml}
          </div>
          <div class="flex justify-between px-1 mt-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Rất không đồng ý</span>
            <span>Rất đồng ý</span>
          </div>
"""
content = re.sub(r'<div class="flex items-center gap-1\.5 w-full">\s*\$\{optionsHtml\}\s*</div>', legend_html, content)

# 5. Fix reset logic
reset_logic = """
    function resetAssessment() {
      userResponses = {};
      localStorage.removeItem('mvab_responses');
      document.getElementById('section-results').classList.add('hidden');
      updateProgressBar();
      renderQuestions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
"""
content = re.sub(r'function resetAssessment\(\) \{.*?\}', reset_logic, content, flags=re.DOTALL)


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("UI Updated successfully")
